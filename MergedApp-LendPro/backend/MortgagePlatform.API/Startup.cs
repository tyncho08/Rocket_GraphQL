using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Linq;
using System;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.Services;

namespace MortgagePlatform.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(Configuration.GetConnectionString("DefaultConnection")));

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = Configuration["Jwt:Issuer"],
                        ValidAudience = Configuration["Jwt:Audience"],
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                    };
                });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp",
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:4001")
                               .AllowAnyHeader()
                               .AllowAnyMethod()
                               .AllowCredentials();
                    });
            });

            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IPropertyService, PropertyService>();
            services.AddScoped<IMortgageService, MortgageService>();
            services.AddScoped<ILoanService, LoanService>();

            services.AddControllers();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ApplicationDbContext context)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI();
                SeedDatabase(context);
            }

            app.UseRouting();
            app.UseCors("AllowAngularApp");
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void SeedDatabase(ApplicationDbContext context)
        {
            try
            {
                context.Database.EnsureCreated();

                // Check if admin user exists
                var existingAdmin = context.Users.FirstOrDefault(u => u.Email == "admin@mortgageplatform.com");
                if (existingAdmin == null)
                {
                    var adminUser = new MortgagePlatform.API.Models.User
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
                    context.SaveChanges();
                }

                // Check if regular user exists
                var existingUser = context.Users.FirstOrDefault(u => u.Email == "john.doe@email.com");
                if (existingUser == null)
                {
                    var regularUser = new MortgagePlatform.API.Models.User
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
                    context.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                // Log error but don't crash the application
                Console.WriteLine("Error seeding database: " + ex.Message);
            }
        }
    }
}