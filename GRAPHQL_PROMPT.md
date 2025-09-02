# PRODUCTION-READY: Complete REST to GraphQL Migration (One-Shot Execution)

**EXECUTE ALL STEPS SEQUENTIALLY WITHOUT STOPPING. DO NOT PAUSE FOR CONFIRMATION UNLESS EXPLICITLY INSTRUCTED.**

You are tasked with migrating the enterprise mortgage lending platform backend from REST API to GraphQL while preserving all existing functionality. This prompt contains all necessary instructions to complete the migration in a single execution without human intervention.

**Source Location**: `/Users/MartinGonella/Desktop/Demos/Rocket_GraphQL/MergedApp-LendPro/`
**Target Location**: `/Users/MartinGonella/Desktop/Demos/Rocket_GraphQL/GraphQL-LendPro/`

**CRITICAL CONSTRAINTS**:
- Frontend URL: http://localhost:4300
- Backend URL: http://localhost:5005

---

## PHASE 0: PRE-MIGRATION ANALYSIS (CRITICAL - UNDERSTAND EXISTING STRUCTURE)

### Step 0.1: Analyze REST API Structure
```bash
echo "🔍 Analyzing existing REST API structure..."

# Document existing endpoints
echo "📋 REST Endpoints to migrate:"
echo "- POST /api/auth/register"
echo "- POST /api/auth/login" 
echo "- GET /api/auth/me"
echo "- POST /api/loans"
echo "- GET /api/loans/{id}"
echo "- GET /api/loans/my"
echo "- GET /api/loans (admin)"
echo "- PUT /api/loans/{id}/status (admin)"
echo "- POST /api/mortgage/calculate"
echo "- POST /api/mortgage/preapproval"
echo "- GET /api/properties/search"
echo "- GET /api/properties/{id}"
echo "- POST /api/properties/{id}/favorite"
echo "- GET /api/properties/favorites"
echo "- GET /api/properties/locations"
```

**CONTINUE AUTOMATICALLY** to Phase 1.

---

## PHASE 1: PROJECT SETUP & STRUCTURE CREATION (MANDATORY - EXECUTE IMMEDIATELY)

### Step 1.1: Create Target Directory Structure
```bash
cd "/Users/MartinGonella/Desktop/Demos/Rocket_GraphQL"
mkdir -p GraphQL-LendPro
cd GraphQL-LendPro

# Create project structure
mkdir -p backend-graphql
mkdir -p frontend
mkdir -p database
mkdir -p tests/LendPro.GraphQL.Tests
```

### Step 1.2: Copy Frontend (PRESERVE ORIGINAL)
```bash
# Copy frontend with port 4300 configuration
echo "📋 Copying frontend..."
rsync -av --exclude=node_modules --exclude=dist ../MergedApp-LendPro/frontend/ ./frontend/ 2>/dev/null || cp -r "../MergedApp-LendPro/frontend/." "./frontend/"

# Update Angular port to 4300
cd frontend
if [ -f "angular.json" ]; then
    echo "🔧 Updating Angular port to 4300..."
    sed -i.bak 's/"port": [0-9]*/"port": 4300/g' angular.json 2>/dev/null || \
    sed -i '' 's/"port": [0-9]*/"port": 4300/g' angular.json
fi

# Update environment files for new backend port
echo "🔧 Updating API URL to port 5005..."
find src/environments -name "*.ts" -exec sed -i.bak 's|http://localhost:[0-9]*/api|http://localhost:5005/graphql|g' {} \; 2>/dev/null || \
find src/environments -name "*.ts" -exec sed -i '' 's|http://localhost:[0-9]*/api|http://localhost:5005/graphql|g' {} \;

cd ..
```

### Step 1.3: Copy Backend for GraphQL Migration
```bash
cp -r "../MergedApp-LendPro/backend/." "./backend-graphql/"
cp -r "../MergedApp-LendPro/database/." "./database/" 2>/dev/null || echo "Database directory not found"
```

**CONTINUE AUTOMATICALLY** to Phase 2.

---

## PHASE 2: BACKEND GRAPHQL MIGRATION (CORE TRANSFORMATION)

### Step 2.1: Update Project File for GraphQL
Navigate to backend-graphql/MortgagePlatform.API/MortgagePlatform.API.csproj and update:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <!-- GraphQL Packages -->
    <PackageReference Include="HotChocolate.AspNetCore" Version="13.9.0" />
    <PackageReference Include="HotChocolate.AspNetCore.Authorization" Version="13.9.0" />
    <PackageReference Include="HotChocolate.Data.EntityFramework" Version="13.9.0" />
    <PackageReference Include="HotChocolate.Types.Analyzers" Version="13.9.0" />
    
    <!-- Entity Framework -->
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.8" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.8" />
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.4" />
    
    <!-- Authentication -->
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.8" />
    <PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="8.0.1" />
    
    <!-- Other -->
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <PackageReference Include="Serilog.AspNetCore" Version="8.0.2" />
  </ItemGroup>
</Project>
```

### Step 2.2: Create GraphQL Directory Structure
```bash
cd backend-graphql/MortgagePlatform.API
mkdir -p GraphQL/Types
mkdir -p GraphQL/Queries
mkdir -p GraphQL/Mutations
mkdir -p GraphQL/Subscriptions
mkdir -p GraphQL/DataLoaders
mkdir -p GraphQL/Extensions
cd ../..
```

### Step 2.3: Create GraphQL Object Types

**Create GraphQL/Types/UserType.cs**:
```csharp
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.GraphQL.Types;

public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Id);
        descriptor.Field(u => u.FirstName);
        descriptor.Field(u => u.LastName);
        descriptor.Field(u => u.Email);
        descriptor.Field(u => u.Role);
        descriptor.Field(u => u.CreatedAt);
        descriptor.Field(u => u.UpdatedAt);
        
        // Hide password hash
        descriptor.Ignore(u => u.PasswordHash);
        
        // Add computed fields
        descriptor.Field("fullName")
            .Type<NonNullType<StringType>>()
            .Resolve(ctx => $"{ctx.Parent<User>().FirstName} {ctx.Parent<User>().LastName}");
        
        // Add related data
        descriptor.Field(u => u.LoanApplications)
            .UseDbContext<ApplicationDbContext>()
            .ResolveWith<UserResolvers>(r => r.GetLoanApplications(default!, default!))
            .UseFiltering()
            .UseSorting();
    }
}

public class UserResolvers
{
    public IQueryable<LoanApplication> GetLoanApplications(
        [Parent] User user,
        [ScopedService] ApplicationDbContext dbContext)
    {
        return dbContext.LoanApplications.Where(la => la.UserId == user.Id);
    }
}
```

**Create GraphQL/Types/PropertyType.cs**:
```csharp
using HotChocolate.Types;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.GraphQL.Types;

public class PropertyType : ObjectType<Property>
{
    protected override void Configure(IObjectTypeDescriptor<Property> descriptor)
    {
        descriptor.Field(p => p.Id);
        descriptor.Field(p => p.Address);
        descriptor.Field(p => p.City);
        descriptor.Field(p => p.State);
        descriptor.Field(p => p.ZipCode);
        descriptor.Field(p => p.Price);
        descriptor.Field(p => p.Bedrooms);
        descriptor.Field(p => p.Bathrooms);
        descriptor.Field(p => p.SquareFeet);
        descriptor.Field(p => p.PropertyType);
        descriptor.Field(p => p.Description);
        descriptor.Field(p => p.ImageUrl);
        descriptor.Field(p => p.ListedDate);
        descriptor.Field(p => p.IsActive);
        
        descriptor.Field("isFavorite")
            .Type<NonNullType<BooleanType>>()
            .Resolve(ctx =>
            {
                var userId = ctx.ContextData.TryGetValue("UserId", out var id) ? (int?)id : null;
                if (userId == null) return false;
                
                var dbContext = ctx.Service<ApplicationDbContext>();
                return dbContext.FavoriteProperties.Any(fp => 
                    fp.PropertyId == ctx.Parent<Property>().Id && 
                    fp.UserId == userId.Value);
            });
    }
}
```

**Create GraphQL/Types/LoanApplicationType.cs**:
```csharp
using HotChocolate.Types;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.GraphQL.Types;

public class LoanApplicationType : ObjectType<LoanApplication>
{
    protected override void Configure(IObjectTypeDescriptor<LoanApplication> descriptor)
    {
        descriptor.Field(la => la.Id);
        descriptor.Field(la => la.UserId);
        descriptor.Field(la => la.LoanAmount);
        descriptor.Field(la => la.PropertyValue);
        descriptor.Field(la => la.DownPayment);
        descriptor.Field(la => la.InterestRate);
        descriptor.Field(la => la.LoanTermYears);
        descriptor.Field(la => la.MonthlyPayment);
        descriptor.Field(la => la.AnnualIncome);
        descriptor.Field(la => la.EmploymentStatus);
        descriptor.Field(la => la.Employer);
        descriptor.Field(la => la.Status);
        descriptor.Field(la => la.Notes);
        descriptor.Field(la => la.CreatedAt);
        descriptor.Field(la => la.UpdatedAt);
        
        descriptor.Field(la => la.User)
            .UseDbContext<ApplicationDbContext>();
            
        descriptor.Field(la => la.Documents)
            .UseDbContext<ApplicationDbContext>();
            
        descriptor.Field(la => la.Payments)
            .UseDbContext<ApplicationDbContext>();
    }
}
```

### Step 2.4: Create Input Types

**Create GraphQL/Types/InputTypes.cs**:
```csharp
using HotChocolate.Types;

namespace MortgagePlatform.API.GraphQL.Types;

public record LoginInput(string Email, string Password);
public record RegisterInput(string FirstName, string LastName, string Email, string Password, string ConfirmPassword);

public record PropertySearchInput(
    string? City,
    string? State,
    decimal? MinPrice,
    decimal? MaxPrice,
    int? MinBedrooms,
    int? MaxBedrooms,
    int? MinBathrooms,
    int? MaxBathrooms,
    string? PropertyType,
    int? Page,
    int? PageSize,
    string? SortBy,
    string? SortOrder
);

public record CreateLoanApplicationInput(
    decimal LoanAmount,
    decimal PropertyValue,
    decimal DownPayment,
    decimal InterestRate,
    int LoanTermYears,
    decimal AnnualIncome,
    string EmploymentStatus,
    string? Employer,
    string? Notes
);

public record UpdateLoanStatusInput(int LoanApplicationId, string Status, string? Notes);

public record MortgageCalculationInput(
    decimal PropertyPrice,
    decimal DownPayment,
    decimal InterestRate,
    int LoanTermYears
);

public record PreApprovalCheckInput(
    decimal AnnualIncome,
    decimal LoanAmount,
    decimal MonthlyDebts
);
```

### Step 2.5: Create Query Root

**Create GraphQL/Queries/Query.cs**:
```csharp
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Data;
using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL.Types;

namespace MortgagePlatform.API.GraphQL.Queries;

public class Query
{
    [Authorize]
    public async Task<User?> GetMe(
        [Service] IAuthService authService,
        [GlobalState("UserId")] int userId)
    {
        return await authService.GetUserByIdAsync(userId);
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    [UsePaging]
    public IQueryable<Property> GetProperties(
        [ScopedService] ApplicationDbContext dbContext,
        PropertySearchInput? search)
    {
        var query = dbContext.Properties.Where(p => p.IsActive);
        
        if (search != null)
        {
            if (!string.IsNullOrEmpty(search.City))
                query = query.Where(p => p.City.ToLower().Contains(search.City.ToLower()));
                
            if (!string.IsNullOrEmpty(search.State))
                query = query.Where(p => p.State == search.State);
                
            if (search.MinPrice.HasValue)
                query = query.Where(p => p.Price >= search.MinPrice.Value);
                
            if (search.MaxPrice.HasValue)
                query = query.Where(p => p.Price <= search.MaxPrice.Value);
                
            if (search.MinBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms >= search.MinBedrooms.Value);
                
            if (search.MaxBedrooms.HasValue)
                query = query.Where(p => p.Bedrooms <= search.MaxBedrooms.Value);
                
            if (search.MinBathrooms.HasValue)
                query = query.Where(p => p.Bathrooms >= search.MinBathrooms.Value);
                
            if (search.MaxBathrooms.HasValue)
                query = query.Where(p => p.Bathrooms <= search.MaxBathrooms.Value);
                
            if (!string.IsNullOrEmpty(search.PropertyType))
                query = query.Where(p => p.PropertyType == search.PropertyType);
        }
        
        return query;
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<Property?> GetProperty(
        int id,
        [ScopedService] ApplicationDbContext dbContext)
    {
        return await dbContext.Properties.FindAsync(id);
    }
    
    [Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetFavoriteProperties(
        [GlobalState("UserId")] int userId,
        [ScopedService] ApplicationDbContext dbContext)
    {
        return dbContext.FavoriteProperties
            .Where(fp => fp.UserId == userId)
            .Select(fp => fp.Property);
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<LocationsDto> GetLocations(
        [ScopedService] ApplicationDbContext dbContext)
    {
        var states = await dbContext.Properties
            .Where(p => p.IsActive)
            .Select(p => p.State)
            .Distinct()
            .OrderBy(s => s)
            .ToListAsync();
            
        var cities = await dbContext.Properties
            .Where(p => p.IsActive)
            .Select(p => p.City)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();
            
        return new LocationsDto { States = states, Cities = cities };
    }
    
    [Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    [UsePaging]
    public IQueryable<LoanApplication> GetMyLoanApplications(
        [GlobalState("UserId")] int userId,
        [ScopedService] ApplicationDbContext dbContext)
    {
        return dbContext.LoanApplications
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .Where(la => la.UserId == userId);
    }
    
    [Authorize]
    public async Task<LoanApplication?> GetLoanApplication(
        int id,
        [GlobalState("UserId")] int userId,
        [GlobalState("UserRole")] string userRole,
        [Service] ILoanService loanService)
    {
        var loan = await loanService.GetLoanApplicationByIdAsync(id);
        
        // Check authorization
        if (loan != null && userRole != "Admin" && loan.UserId != userId)
            return null;
            
        return loan;
    }
    
    [Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    [UsePaging]
    public IQueryable<LoanApplication> GetAllLoanApplications(
        [ScopedService] ApplicationDbContext dbContext)
    {
        return dbContext.LoanApplications
            .Include(la => la.User)
            .Include(la => la.Documents)
            .Include(la => la.Payments);
    }
    
    public async Task<MortgageCalculationResultDto> CalculateMortgage(
        MortgageCalculationInput input,
        [Service] IMortgageService mortgageService)
    {
        return await mortgageService.CalculateMortgageAsync(new MortgageCalculationDto
        {
            PropertyPrice = input.PropertyPrice,
            DownPayment = input.DownPayment,
            InterestRate = input.InterestRate,
            LoanTermYears = input.LoanTermYears
        });
    }
    
    public async Task<PreApprovalResultDto> CheckPreApproval(
        PreApprovalCheckInput input,
        [Service] IMortgageService mortgageService)
    {
        return await mortgageService.CheckPreApprovalAsync(new PreApprovalCheckDto
        {
            AnnualIncome = input.AnnualIncome,
            LoanAmount = input.LoanAmount,
            MonthlyDebts = input.MonthlyDebts
        });
    }
}

public record LocationsDto(List<string> States, List<string> Cities);
public record MortgageCalculationResultDto(
    decimal MonthlyPayment,
    decimal TotalInterest,
    decimal TotalPayment,
    decimal LoanAmount,
    List<AmortizationItem> AmortizationSchedule
);
public record AmortizationItem(
    int Month,
    decimal Principal,
    decimal Interest,
    decimal Balance
);
public record PreApprovalResultDto(
    bool IsApproved,
    decimal MaxLoanAmount,
    decimal DebtToIncomeRatio,
    string Message
);
```

### Step 2.6: Create Mutations

**Create GraphQL/Mutations/Mutation.cs**:
```csharp
using HotChocolate;
using HotChocolate.Authorization;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Services;
using MortgagePlatform.API.GraphQL.Types;

namespace MortgagePlatform.API.GraphQL.Mutations;

public class Mutation
{
    public async Task<AuthPayload> Login(
        LoginInput input,
        [Service] IAuthService authService)
    {
        try
        {
            var token = await authService.LoginAsync(new LoginDto 
            { 
                Email = input.Email, 
                Password = input.Password 
            });
            
            var user = await authService.GetUserByEmailAsync(input.Email);
            
            return new AuthPayload(token, user, null);
        }
        catch (Exception ex)
        {
            return new AuthPayload(null, null, new[] { new UserError(ex.Message, "AUTH_ERROR") });
        }
    }
    
    public async Task<AuthPayload> Register(
        RegisterInput input,
        [Service] IAuthService authService)
    {
        try
        {
            if (input.Password != input.ConfirmPassword)
                return new AuthPayload(null, null, new[] { new UserError("Passwords do not match", "VALIDATION_ERROR") });
                
            var user = await authService.RegisterAsync(new RegisterDto
            {
                FirstName = input.FirstName,
                LastName = input.LastName,
                Email = input.Email,
                Password = input.Password,
                ConfirmPassword = input.ConfirmPassword
            });
            
            var token = await authService.LoginAsync(new LoginDto 
            { 
                Email = input.Email, 
                Password = input.Password 
            });
            
            return new AuthPayload(token, user, null);
        }
        catch (Exception ex)
        {
            return new AuthPayload(null, null, new[] { new UserError(ex.Message, "REGISTRATION_ERROR") });
        }
    }
    
    [Authorize]
    public async Task<PropertyPayload> ToggleFavoriteProperty(
        int propertyId,
        [GlobalState("UserId")] int userId,
        [Service] IPropertyService propertyService)
    {
        try
        {
            var isFavorite = await propertyService.ToggleFavoriteAsync(propertyId, userId);
            var property = await propertyService.GetPropertyByIdAsync(propertyId);
            
            return new PropertyPayload(property, isFavorite, null);
        }
        catch (Exception ex)
        {
            return new PropertyPayload(null, false, new[] { new UserError(ex.Message, "FAVORITE_ERROR") });
        }
    }
    
    [Authorize]
    public async Task<LoanApplicationPayload> CreateLoanApplication(
        CreateLoanApplicationInput input,
        [GlobalState("UserId")] int userId,
        [Service] ILoanService loanService,
        [Service] IMortgageService mortgageService)
    {
        try
        {
            // Calculate monthly payment
            var calculation = await mortgageService.CalculateMortgageAsync(new MortgageCalculationDto
            {
                PropertyPrice = input.PropertyValue,
                DownPayment = input.DownPayment,
                InterestRate = input.InterestRate,
                LoanTermYears = input.LoanTermYears
            });
            
            var loanApp = await loanService.CreateLoanApplicationAsync(new CreateLoanApplicationDto
            {
                LoanAmount = input.LoanAmount,
                PropertyValue = input.PropertyValue,
                DownPayment = input.DownPayment,
                InterestRate = input.InterestRate,
                LoanTermYears = input.LoanTermYears,
                AnnualIncome = input.AnnualIncome,
                EmploymentStatus = input.EmploymentStatus,
                Employer = input.Employer,
                Notes = input.Notes
            }, userId);
            
            return new LoanApplicationPayload(loanApp, null);
        }
        catch (Exception ex)
        {
            return new LoanApplicationPayload(null, new[] { new UserError(ex.Message, "LOAN_ERROR") });
        }
    }
    
    [Authorize(Roles = new[] { "Admin" })]
    public async Task<LoanApplicationPayload> UpdateLoanApplicationStatus(
        UpdateLoanStatusInput input,
        [Service] ILoanService loanService)
    {
        try
        {
            var loanApp = await loanService.UpdateLoanApplicationStatusAsync(
                input.LoanApplicationId,
                new UpdateLoanApplicationStatusDto
                {
                    Status = input.Status,
                    Notes = input.Notes
                });
                
            return new LoanApplicationPayload(loanApp, null);
        }
        catch (Exception ex)
        {
            return new LoanApplicationPayload(null, new[] { new UserError(ex.Message, "UPDATE_ERROR") });
        }
    }
}

// Payload types
public record AuthPayload(string? Token, User? User, IReadOnlyList<UserError>? Errors);
public record PropertyPayload(Property? Property, bool IsFavorite, IReadOnlyList<UserError>? Errors);
public record LoanApplicationPayload(LoanApplication? LoanApplication, IReadOnlyList<UserError>? Errors);
public record UserError(string Message, string Code);
```

### Step 2.7: Create GraphQL Extensions

**Create GraphQL/Extensions/GraphQLRequestInterceptor.cs**:
```csharp
using HotChocolate.AspNetCore;
using HotChocolate.Execution;
using System.Security.Claims;

namespace MortgagePlatform.API.GraphQL.Extensions;

public class GraphQLRequestInterceptor : DefaultHttpRequestInterceptor
{
    public override ValueTask OnCreateAsync(
        HttpContext context,
        IRequestExecutor requestExecutor,
        IQueryRequestBuilder requestBuilder,
        CancellationToken cancellationToken)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out var id))
            {
                requestBuilder.SetGlobalState("UserId", id);
                requestBuilder.SetGlobalState("UserRole", userRole);
            }
        }
        
        return base.OnCreateAsync(context, requestExecutor, requestBuilder, cancellationToken);
    }
}
```

### Step 2.8: Update Program.cs for GraphQL

**Replace Program.cs with GraphQL configuration**:
```csharp
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
    .CreateLogger();

builder.Host.UseSerilog();

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// JWT Authentication
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
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS - Support frontend on port 4300
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

// Business Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPropertyService, PropertyService>();
builder.Services.AddScoped<IMortgageService, MortgageService>();
builder.Services.AddScoped<ILoanService, LoanService>();

// GraphQL
builder.Services
    .AddGraphQLServer()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddType<UserType>()
    .AddType<PropertyType>()
    .AddType<LoanApplicationType>()
    .AddTypeExtension<UserResolvers>()
    .AddFiltering()
    .AddSorting()
    .AddProjections()
    .AddAuthorization()
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>()
    .ModifyRequestOptions(opt => opt.IncludeExceptionDetails = builder.Environment.IsDevelopment());

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
app.UseCors("AllowAngularApp");
app.UseAuthentication();
app.UseAuthorization();

app.MapGraphQL();

app.Run();

// Database seeding method
static async Task SeedDatabase(IServiceProvider services)
{
    try
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        
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
            await context.SaveChangesAsync();
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
            await context.SaveChangesAsync();
        }

        // Seed sample properties
        if (!context.Properties.Any())
        {
            var properties = new[]
            {
                new Property
                {
                    Address = "123 Main St",
                    City = "Austin",
                    State = "TX",
                    ZipCode = "78701",
                    Price = 450000,
                    Bedrooms = 3,
                    Bathrooms = 2,
                    SquareFeet = 1800,
                    PropertyType = "Single Family",
                    Description = "Beautiful home in downtown Austin",
                    ImageUrl = "/assets/images/property-placeholder.jpg",
                    ListedDate = DateTime.UtcNow.AddDays(-30),
                    IsActive = true
                },
                new Property
                {
                    Address = "456 Oak Ave",
                    City = "Dallas",
                    State = "TX",
                    ZipCode = "75201",
                    Price = 350000,
                    Bedrooms = 2,
                    Bathrooms = 2,
                    SquareFeet = 1200,
                    PropertyType = "Condo",
                    Description = "Modern condo with city views",
                    ImageUrl = "/assets/images/property-placeholder.jpg",
                    ListedDate = DateTime.UtcNow.AddDays(-15),
                    IsActive = true
                }
            };

            context.Properties.AddRange(properties);
            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Log.Error(ex, "Error seeding database");
    }
}
```

**CONTINUE AUTOMATICALLY** to Phase 3.

---

## PHASE 3: FRONTEND APOLLO CLIENT INTEGRATION (CRITICAL FOR GRAPHQL)

### Step 3.1: Install Apollo Client Dependencies
```bash
cd frontend
npm install @apollo/client graphql graphql-tag
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-apollo-angular
cd ..
```

### Step 3.2: Create Apollo Configuration

**Create frontend/src/app/graphql/apollo.config.ts**:
```typescript
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { ApplicationConfig, inject } from '@angular/core';
import { ApolloClientOptions, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';

const uri = 'http://localhost:5005/graphql';

export function apolloOptionsFactory(): ApolloClientOptions<any> {
  const httpLink = inject(HttpLink);
  
  const auth = setContext((operation, context) => {
    const token = localStorage.getItem('auth_token');
    
    if (token === null) {
      return {};
    } else {
      return {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
    }
  });

  return {
    link: ApolloLink.from([auth, httpLink.create({ uri })]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network'
      }
    }
  };
}

export const graphqlProviders: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: apolloOptionsFactory,
  },
];
```

### Step 3.3: Create GraphQL Queries and Mutations

**Create frontend/src/app/graphql/queries.ts**:
```typescript
import { gql } from '@apollo/client/core';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
      errors {
        message
        code
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        role
      }
      errors {
        message
        code
      }
    }
  }
`;

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      firstName
      lastName
      email
      role
      fullName
    }
  }
`;

export const SEARCH_PROPERTIES_QUERY = gql`
  query SearchProperties($search: PropertySearchInput, $first: Int, $after: String) {
    properties(where: $search, first: $first, after: $after) {
      edges {
        node {
          id
          address
          city
          state
          zipCode
          price
          bedrooms
          bathrooms
          squareFeet
          propertyType
          description
          imageUrl
          listedDate
          isFavorite
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_PROPERTY_QUERY = gql`
  query GetProperty($id: Int!) {
    property(id: $id) {
      id
      address
      city
      state
      zipCode
      price
      bedrooms
      bathrooms
      squareFeet
      propertyType
      description
      imageUrl
      listedDate
      isFavorite
    }
  }
`;

export const TOGGLE_FAVORITE_MUTATION = gql`
  mutation ToggleFavorite($propertyId: Int!) {
    toggleFavoriteProperty(propertyId: $propertyId) {
      property {
        id
        isFavorite
      }
      isFavorite
      errors {
        message
        code
      }
    }
  }
`;

export const GET_LOCATIONS_QUERY = gql`
  query GetLocations {
    locations {
      states
      cities
    }
  }
`;

export const CALCULATE_MORTGAGE_QUERY = gql`
  query CalculateMortgage($input: MortgageCalculationInput!) {
    calculateMortgage(input: $input) {
      monthlyPayment
      totalInterest
      totalPayment
      loanAmount
      amortizationSchedule {
        month
        principal
        interest
        balance
      }
    }
  }
`;

export const CREATE_LOAN_APPLICATION_MUTATION = gql`
  mutation CreateLoanApplication($input: CreateLoanApplicationInput!) {
    createLoanApplication(input: $input) {
      loanApplication {
        id
        loanAmount
        status
        createdAt
      }
      errors {
        message
        code
      }
    }
  }
`;

export const GET_MY_LOAN_APPLICATIONS_QUERY = gql`
  query GetMyLoanApplications {
    myLoanApplications {
      edges {
        node {
          id
          loanAmount
          propertyValue
          downPayment
          interestRate
          loanTermYears
          monthlyPayment
          status
          createdAt
          updatedAt
        }
      }
    }
  }
`;
```

### Step 3.4: Update Services to Use GraphQL

**Update frontend/src/app/auth/services/auth.service.ts**:
```typescript
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LOGIN_MUTATION, REGISTER_MUTATION, GET_ME_QUERY } from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apollo: Apollo,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  login(email: string, password: string): Observable<any> {
    return this.apollo.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password }
    }).pipe(
      map(result => result.data.login),
      tap(response => {
        if (response.token && response.user) {
          localStorage.setItem('auth_token', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables: { input: userData }
    }).pipe(
      map(result => result.data.register),
      tap(response => {
        if (response.token && response.user) {
          localStorage.setItem('auth_token', response.token);
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.apollo.client.clearStore();
    this.router.navigate(['/login']);
  }

  private checkAuthStatus(): void {
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.apollo.query({
        query: GET_ME_QUERY,
        fetchPolicy: 'network-only'
      }).subscribe({
        next: (result: any) => {
          if (result.data?.me) {
            this.currentUserSubject.next(result.data.me);
          }
        },
        error: () => {
          this.logout();
        }
      });
    }
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser$;
  }

  isAdmin(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === 'Admin')
    );
  }
}
```

**Update frontend/src/app/home-search/services/property.service.ts**:
```typescript
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable, map } from 'rxjs';
import { 
  SEARCH_PROPERTIES_QUERY, 
  GET_PROPERTY_QUERY, 
  TOGGLE_FAVORITE_MUTATION,
  GET_LOCATIONS_QUERY 
} from '../../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private apollo: Apollo) {}

  searchProperties(searchParams: any): Observable<any> {
    return this.apollo.query({
      query: SEARCH_PROPERTIES_QUERY,
      variables: {
        search: searchParams,
        first: searchParams.pageSize || 10,
        after: null
      }
    }).pipe(
      map(result => {
        const data = result.data as any;
        return {
          properties: data.properties.edges.map((e: any) => e.node),
          totalCount: data.properties.totalCount,
          hasNextPage: data.properties.pageInfo.hasNextPage
        };
      })
    );
  }

  getPropertyById(id: number): Observable<any> {
    return this.apollo.query({
      query: GET_PROPERTY_QUERY,
      variables: { id }
    }).pipe(
      map(result => (result.data as any).property)
    );
  }

  toggleFavorite(propertyId: number): Observable<boolean> {
    return this.apollo.mutate({
      mutation: TOGGLE_FAVORITE_MUTATION,
      variables: { propertyId }
    }).pipe(
      map(result => (result.data as any).toggleFavoriteProperty.isFavorite)
    );
  }

  getLocations(): Observable<any> {
    return this.apollo.query({
      query: GET_LOCATIONS_QUERY
    }).pipe(
      map(result => (result.data as any).locations)
    );
  }
}
```

### Step 3.5: Update App Configuration

**Update frontend/src/app/app.config.ts**:
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { graphqlProviders } from './graphql/apollo.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
    ...graphqlProviders
  ]
};
```

**CONTINUE AUTOMATICALLY** to Phase 4.

---

## PHASE 4: CREATE DEVELOPMENT SCRIPTS

### Step 4.1: Create run-app.sh at Root Level
```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 LendPro GraphQL Application Launcher${NC}"
echo -e "${BLUE}=========================================${NC}"

# Function to clean up ports
cleanup_ports() {
    echo -e "${CYAN}🧹 Cleaning up ports...${NC}"
    
    # Kill processes on port 4300 (Frontend)
    lsof -ti:4300 | xargs kill -9 2>/dev/null || true
    
    # Kill processes on port 5005 (GraphQL Backend)
    lsof -ti:5005 | xargs kill -9 2>/dev/null || true
    
    # Kill any remaining dotnet or ng serve processes
    pkill -f "dotnet.*5005" 2>/dev/null || true
    pkill -f "ng serve" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Ports cleaned up${NC}"
    sleep 2
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${CYAN}🔍 Checking prerequisites...${NC}"
    
    # Check for .NET
    if ! command -v dotnet &> /dev/null; then
        echo -e "${RED}❌ .NET SDK not found. Please install .NET 8 SDK${NC}"
        exit 1
    fi
    
    DOTNET_VERSION=$(dotnet --version | cut -d. -f1)
    if [ "$DOTNET_VERSION" -lt 8 ]; then
        echo -e "${RED}❌ .NET 8+ required. Current version: $(dotnet --version)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ .NET SDK $(dotnet --version)${NC}"
    
    # Check for Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js $(node --version)${NC}"
    
    # Check for npm
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}❌ npm not found${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ npm $(npm --version)${NC}"
}

# Function to build and start backend
start_backend() {
    echo -e "${CYAN}🔧 Building and starting GraphQL backend...${NC}"
    cd backend-graphql/MortgagePlatform.API
    
    # Clean and restore packages
    echo -e "${YELLOW}📦 Restoring packages...${NC}"
    dotnet clean > /dev/null 2>&1
    dotnet restore > /dev/null 2>&1
    
    # Build the project
    echo -e "${YELLOW}🔨 Building project...${NC}"
    if dotnet build > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend build successful${NC}"
        
        # Start the API in background
        echo -e "${YELLOW}🌐 Starting GraphQL backend...${NC}"
        export ASPNETCORE_ENVIRONMENT=Development
        export ASPNETCORE_URLS=http://localhost:5005
        nohup dotnet run > ../../backend.log 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../../.backend.pid
        
        echo -e "${GREEN}🔗 GraphQL Backend starting on http://localhost:5005${NC}"
        echo -e "${GREEN}📚 GraphQL Playground available at http://localhost:5005/graphql${NC}"
    else
        echo -e "${RED}❌ Backend build failed. Check backend.log for details${NC}"
        exit 1
    fi
    
    cd ../..
}

# Function to start frontend
start_frontend() {
    echo -e "${CYAN}🎨 Starting Angular frontend...${NC}"
    cd frontend
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install --force > ../frontend-install.log 2>&1
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
            exit 1
        fi
    fi
    
    # Start Angular development server on port 4300
    echo -e "${YELLOW}🚀 Starting frontend on port 4300...${NC}"
    nohup npm start > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > ../.frontend.pid
    
    cd ..
}

# Function to wait for services
wait_for_services() {
    echo -e "${CYAN}⏳ Waiting for services to start...${NC}"
    
    # Wait for backend
    echo -e "${YELLOW}🔄 Waiting for GraphQL backend...${NC}"
    for i in {1..30}; do
        if curl -s http://localhost:5005/graphql > /dev/null 2>&1; then
            echo -e "${GREEN}✅ GraphQL Backend is ready!${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend failed to start. Check backend.log${NC}"
            cleanup_and_exit
        fi
        sleep 2
    done
    
    # Wait for frontend
    echo -e "${YELLOW}🔄 Waiting for frontend...${NC}"
    for i in {1..45}; do
        if curl -s http://localhost:4300 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend is ready!${NC}"
            break
        fi
        if [ $i -eq 45 ]; then
            echo -e "${RED}❌ Frontend failed to start. Check frontend.log${NC}"
            cleanup_and_exit
        fi
        sleep 2
    done
}

# Function to cleanup and exit
cleanup_and_exit() {
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true  
        rm .frontend.pid
    fi
    cleanup_ports
    exit 1
}

# Trap Ctrl+C to cleanup
trap cleanup_and_exit INT

# Main execution
echo -e "${BLUE}Starting GraphQL application setup...${NC}"
echo ""

# Step 1: Check prerequisites
check_prerequisites
echo ""

# Step 2: Clean up any existing processes
cleanup_ports
echo ""

# Step 3: Start backend
start_backend
echo ""

# Step 4: Start frontend  
start_frontend
echo ""

# Step 5: Wait for services to be ready
wait_for_services
echo ""

# Step 6: Final status
echo -e "${BLUE}🎉 LendPro GraphQL Application Started Successfully!${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo -e "${GREEN}📊 Frontend:${NC} http://localhost:4300"
echo -e "${GREEN}🔗 GraphQL Backend:${NC} http://localhost:5005"
echo -e "${GREEN}📚 GraphQL Playground:${NC} http://localhost:5005/graphql"
echo ""
echo -e "${BLUE}🔑 Test Accounts:${NC}"
echo -e "Regular User: ${YELLOW}john.doe@email.com${NC} / ${YELLOW}user123${NC}"
echo -e "Admin User: ${YELLOW}admin@mortgageplatform.com${NC} / ${YELLOW}admin123${NC}"
echo ""
echo -e "${BLUE}📋 Sample GraphQL Queries:${NC}"
echo -e "${CYAN}# Login:${NC}"
echo 'mutation { login(input: { email: "john.doe@email.com", password: "user123" }) { token user { firstName lastName email } } }'
echo ""
echo -e "${CYAN}# Search Properties:${NC}"
echo 'query { properties(first: 10) { edges { node { id address city state price bedrooms bathrooms } } } }'
echo ""
echo -e "${BLUE}📋 Log Files:${NC}"
echo -e "Backend: ${YELLOW}backend.log${NC}"
echo -e "Frontend: ${YELLOW}frontend.log${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Wait for user interruption
wait
```

### Step 4.2: Create README.md
```markdown
# LendPro GraphQL Migration - Full-Stack Application

> **Enterprise Mortgage Lending Platform** - Migrated from REST API to GraphQL with Apollo Client

## 🏗️ Project Structure

```
GraphQL-LendPro/
├── frontend/           # Angular frontend with Apollo Client
├── backend-graphql/    # .NET 8 GraphQL backend with HotChocolate
├── database/           # Database scripts and migrations
├── tests/              # GraphQL integration tests
├── run-app.sh          # Single-command deployment script
└── README.md           # This file
```

## 🚀 Quick Start (Single Command)

```bash
./run-app.sh
```

**That's it!** This single script will:
- 🧹 Clean up any processes on ports 4300 and 5005
- 🔧 Build the GraphQL backend automatically
- 📦 Install frontend dependencies with Apollo Client
- 🚀 Start both services on the correct ports
- ✨ Show you GraphQL playground and sample queries

## 🌐 Application URLs

- **🎨 Frontend**: http://localhost:4300 (Angular with Apollo Client)
- **🔗 GraphQL Backend**: http://localhost:5005 (HotChocolate GraphQL)
- **📚 GraphQL Playground**: http://localhost:5005/graphql (Interactive GraphQL IDE)

## 🔑 Test Accounts

- **Regular User**: `john.doe@email.com` / `user123`
- **Admin User**: `admin@mortgageplatform.com` / `admin123`

## 🎯 Migration Highlights

### REST → GraphQL Transformation

#### Before (REST):
```http
GET /api/properties/search?city=Austin&minPrice=200000&maxPrice=500000
GET /api/properties/123
POST /api/properties/123/favorite
```

#### After (GraphQL):
```graphql
query SearchProperties {
  properties(
    where: { 
      city: "Austin", 
      minPrice: 200000, 
      maxPrice: 500000 
    }
  ) {
    edges {
      node {
        id
        address
        city
        price
        bedrooms
        bathrooms
        isFavorite
      }
    }
  }
}
```

### Key Features of GraphQL Implementation

1. **Flexible Queries**: Request exactly what you need
2. **Type Safety**: Strongly typed schema with code generation
3. **Real-time Updates**: Subscription support for live data
4. **Efficient Data Loading**: DataLoader pattern prevents N+1 queries
5. **Field-level Authorization**: Fine-grained security control
6. **Automatic Filtering & Sorting**: Built-in with HotChocolate
7. **Apollo Client Integration**: Modern state management and caching

## 📋 Sample GraphQL Operations

### Authentication
```graphql
mutation Login {
  login(input: { 
    email: "john.doe@email.com", 
    password: "user123" 
  }) {
    token
    user {
      id
      firstName
      lastName
      email
      role
    }
    errors {
      message
      code
    }
  }
}
```

### Property Search with Filtering
```graphql
query PropertySearch {
  properties(
    where: {
      city: "Austin"
      minPrice: 300000
      maxPrice: 600000
      minBedrooms: 3
    }
    first: 10
    order: { price: ASC }
  ) {
    edges {
      node {
        id
        address
        city
        state
        price
        bedrooms
        bathrooms
        squareFeet
        propertyType
        isFavorite
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### Create Loan Application
```graphql
mutation CreateLoan {
  createLoanApplication(input: {
    loanAmount: 400000
    propertyValue: 500000
    downPayment: 100000
    interestRate: 4.5
    loanTermYears: 30
    annualIncome: 120000
    employmentStatus: "Full-Time"
    employer: "Tech Corp"
  }) {
    loanApplication {
      id
      monthlyPayment
      status
      createdAt
    }
    errors {
      message
      code
    }
  }
}
```

### Mortgage Calculator
```graphql
query CalculateMortgage {
  calculateMortgage(input: {
    propertyPrice: 500000
    downPayment: 100000
    interestRate: 4.5
    loanTermYears: 30
  }) {
    monthlyPayment
    totalInterest
    totalPayment
    loanAmount
    amortizationSchedule {
      month
      principal
      interest
      balance
    }
  }
}
```

## 🛠️ Development Workflow

1. **Start Everything**: `./run-app.sh`
2. **GraphQL Playground**: Navigate to http://localhost:5005/graphql
3. **Frontend Development**: Changes auto-reload at http://localhost:4300
4. **Backend Development**: GraphQL schema changes auto-reload
5. **Stop Services**: Press `Ctrl+C` to stop all services cleanly

## 🧪 Testing

### GraphQL Integration Tests
```bash
cd tests/LendPro.GraphQL.Tests
dotnet test
```

### Test GraphQL Queries
Use the GraphQL Playground at http://localhost:5005/graphql to test queries interactively.

## 🔧 Technology Stack

### Backend
- **.NET 8 LTS**: Modern C# with performance improvements
- **HotChocolate**: Enterprise-grade GraphQL server
- **Entity Framework Core 8**: ORM with PostgreSQL
- **JWT Authentication**: Secure token-based auth
- **DataLoader**: Efficient data fetching pattern

### Frontend
- **Angular 17**: Modern TypeScript framework
- **Apollo Client**: GraphQL client with caching
- **GraphQL Code Generator**: Type-safe queries
- **RxJS**: Reactive programming
- **Angular Material**: UI components

## 📈 Performance Benefits

1. **Reduced Over-fetching**: Request only needed fields
2. **Fewer Round Trips**: Batch multiple queries
3. **Smart Caching**: Apollo Client cache management
4. **Optimized Queries**: DataLoader prevents N+1 issues
5. **Real-time Updates**: Subscriptions for live data

## 🔒 Security Features

- JWT Bearer Authentication
- Field-level Authorization
- Role-based Access Control (User/Admin)
- Secure Password Hashing (BCrypt)
- CORS Configuration for Frontend

## 🚨 Troubleshooting

### Common Issues

1. **Port Conflicts**:
   ```bash
   # The script handles this automatically, but if needed:
   lsof -ti:4300 | xargs kill -9  # Frontend
   lsof -ti:5005 | xargs kill -9  # Backend
   ```

2. **GraphQL Schema Issues**:
   - Check http://localhost:5005/graphql for schema explorer
   - Verify all types are registered in Program.cs

3. **Apollo Client Cache**:
   - Clear browser cache and localStorage
   - Use `apollo.client.clearStore()` to reset cache

4. **CORS Errors**:
   - Ensure frontend runs on http://localhost:4300
   - Check CORS policy in Program.cs

---

**The complete mortgage lending platform now runs on GraphQL with modern architecture, providing flexible queries, real-time updates, and improved performance while maintaining all original functionality.**
```

### Step 4.3: Make Scripts Executable
```bash
chmod +x run-app.sh
```

---

## PHASE 5: TESTING & VALIDATION

### Step 5.1: Create GraphQL Test Project
```bash
cd tests/LendPro.GraphQL.Tests
dotnet new xunit
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package HotChocolate.AspNetCore.Testing
```

**Create GraphQLTests.cs**:
```csharp
using Microsoft.AspNetCore.Mvc.Testing;
using HotChocolate.AspNetCore.Testing;
using System.Net.Http.Headers;

namespace LendPro.GraphQL.Tests;

public class GraphQLTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public GraphQLTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Schema_Should_Be_Valid()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync("/graphql?sdl");

        // Assert
        response.EnsureSuccessStatusCode();
        var schema = await response.Content.ReadAsStringAsync();
        Assert.Contains("type Query", schema);
        Assert.Contains("type Mutation", schema);
    }

    [Fact]
    public async Task Login_Should_Return_Token()
    {
        // Arrange
        var client = _factory.CreateClient();
        var query = @"
            mutation {
                login(input: { email: ""john.doe@email.com"", password: ""user123"" }) {
                    token
                    user {
                        email
                    }
                }
            }";

        // Act
        var response = await client.PostGraphQLAsync(query);

        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("token", content);
        Assert.Contains("john.doe@email.com", content);
    }
}
```

### Step 5.2: Verify Build
```bash
cd backend-graphql/MortgagePlatform.API
dotnet build
cd ../..
```

---

## FINAL VALIDATION CHECKLIST

1. **✅ Frontend Updated**: 
   - Angular port set to 4300
   - Apollo Client integrated
   - Environment URLs updated to GraphQL endpoint

2. **✅ Backend Migrated**:
   - HotChocolate GraphQL packages installed
   - GraphQL types, queries, mutations created
   - REST controllers replaced with GraphQL resolvers
   - Port configured to 5005

3. **✅ Features Preserved**:
   - User authentication with JWT
   - Property search with filtering
   - Favorite properties functionality
   - Loan applications
   - Mortgage calculations
   - Admin functionality

4. **✅ Development Experience**:
   - Single run-app.sh script
   - GraphQL Playground at /graphql
   - Hot reload for both frontend and backend
   - Clear documentation with examples

**MIGRATION COMPLETE** - The full-stack application has been successfully migrated from REST API to GraphQL with Apollo Client integration, running on the specified ports (Frontend: 4300, Backend: 5005).