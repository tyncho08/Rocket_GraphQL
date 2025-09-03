using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Serilog;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.GraphQL.Queries;
using MortgagePlatform.API.GraphQL.Mutations;
using MortgagePlatform.API.GraphQL.Types;
using MortgagePlatform.API.GraphQL.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Configure to use port 5005
builder.WebHost.UseUrls("http://localhost:5005");

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/app-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Database Configuration - CRITICAL: Order matters for HotChocolate
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Database=MortgagePlatform;Username=postgres;Password=admin;";

// Add both DbContext and DbContextFactory for HotChocolate 13.x
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication Configuration
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? "ThisIsASecretKeyForJWTTokenGeneration123456789");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"] ?? "MortgagePlatformAPI",
            ValidAudience = jwtSettings["Audience"] ?? "MortgagePlatformClient",
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS Configuration - Allow frontend on port 4300
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4300")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Business Services Registration
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IMortgageService, MortgageService>();
builder.Services.AddScoped<ILoanService, LoanService>();

// GraphQL Server Configuration
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<UserType>()
    .AddType<PropertyType>()
    .AddType<LoanApplicationType>()
    .AddFiltering()
    .AddSorting()
    .AddProjections()
    .AddAuthorization()
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>()
    .ModifyRequestOptions(opt => 
    {
        opt.IncludeExceptionDetails = builder.Environment.IsDevelopment();
        opt.ExecutionTimeout = TimeSpan.FromMinutes(1);
    });

// Add health checks
builder.Services.AddHealthChecks();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    
    // Seed database in development
    await SeedDatabase(app.Services);
}

app.UseHttpsRedirection();
app.UseRouting();

// Enable CORS before authentication
app.UseCors("AllowAngularApp");

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// GraphQL endpoint
app.MapGraphQL();

// Health check endpoint
app.MapHealthChecks("/health");

app.Run();

// Database seeding method
static async Task SeedDatabase(IServiceProvider services)
{
    try
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        logger.LogInformation("Starting database seeding...");
        
        await context.Database.EnsureCreatedAsync();

        // Seed admin user
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@mortgageplatform.com");
        if (existingAdmin == null)
        {
            var adminUser = new User
            {
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@mortgageplatform.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(adminUser);
            logger.LogInformation("Created admin user");
        }

        // Seed regular user
        var existingUser = await context.Users.FirstOrDefaultAsync(u => u.Email == "john.doe@email.com");
        if (existingUser == null)
        {
            var regularUser = new User
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@email.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("user123"),
                Role = "User",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Users.Add(regularUser);
            logger.LogInformation("Created regular user");
        }

        await context.SaveChangesAsync();

        // Seed sample properties
        if (!await context.Properties.AnyAsync())
        {
            var properties = new[]
            {
                new Property
                {
                    Address = "123 Main St", City = "Austin", State = "TX", ZipCode = "78701",
                    Price = 450000, Bedrooms = 3, Bathrooms = 2, SquareFeet = 1800,
                    PropertyType = "Single Family", Description = "Beautiful home in downtown Austin.",
                    ImageUrl = "/assets/images/property-placeholder.jpg", 
                    ListedDate = DateTime.UtcNow.AddDays(-30), IsActive = true
                },
                new Property
                {
                    Address = "456 Oak Ave", City = "Dallas", State = "TX", ZipCode = "75201", 
                    Price = 350000, Bedrooms = 2, Bathrooms = 2, SquareFeet = 1200,
                    PropertyType = "Condo", Description = "Modern condo with city views.",
                    ImageUrl = "/assets/images/property-placeholder.jpg",
                    ListedDate = DateTime.UtcNow.AddDays(-15), IsActive = true
                }
            };

            context.Properties.AddRange(properties);
            await context.SaveChangesAsync();
            logger.LogInformation("Created sample properties");
        }

        logger.LogInformation("Database seeding completed successfully");
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error seeding database");
    }
}