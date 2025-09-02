# PRODUCTION-READY: Complete REST to GraphQL Migration (One-Shot Execution)

**EXECUTE ALL STEPS SEQUENTIALLY WITHOUT STOPPING. DO NOT PAUSE FOR CONFIRMATION UNLESS EXPLICITLY INSTRUCTED.**

You are tasked with migrating the enterprise mortgage lending platform backend from REST API to GraphQL while preserving all existing functionality. This prompt contains all necessary instructions to complete the migration in a single execution without human intervention.

**Source Location**: `/Users/MartinGonella/Desktop/Demos/Rocket_GraphQL/MergedApp-LendPro/`
**Target Location**: `/Users/MartinGonella/Desktop/Demos/Rocket_GraphQL/GraphQL-LendPro/`

**CRITICAL CONSTRAINTS**:
- Frontend URL: http://localhost:4300
- Backend URL: http://localhost:5005

---

## PHASE 0: SETUP

Copy existing app structure from source to target location.

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
    string? PropertyType
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

**CRITICAL: HotChocolate 13.x Middleware Order Requirements**
The middleware order for HotChocolate 13.x is EXTREMELY important. Use this exact order:
1. UseDbContext
2. UsePaging  
3. UseFiltering
4. UseSorting

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
using DTOs = MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.GraphQL.Queries;

public class Query
{
    // Authentication Queries
    [Authorize]
    public async Task<User?> GetMe(
        [Service] IAuthService authService,
        [GlobalState("UserId")] int userId)
    {
        return await authService.GetUserByIdAsync(userId);
    }
    
    // Property Queries - CRITICAL: Middleware order must be exact
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
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
        return await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
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
            .Select(fp => fp.Property)
            .Where(p => p.IsActive);
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<DTOs.LocationsDto> GetLocations(
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
            
        return new DTOs.LocationsDto { States = states.ToArray(), Cities = cities.ToArray() };
    }
    
    // Loan Application Queries - CRITICAL: Middleware order
    [Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
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
    public async Task<DTOs.LoanApplicationDto?> GetLoanApplication(
        int id,
        [GlobalState("UserId")] int userId,
        [GlobalState("UserRole")] string userRole,
        [Service] ILoanService loanService)
    {
        var loan = await loanService.GetLoanApplicationByIdAsync(id);
        
        // Check authorization - user can only see their own loans unless they're admin
        if (loan != null && userRole != "Admin" && loan.UserId != userId)
            return null;
            
        return loan;
    }
    
    [Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<LoanApplication> GetAllLoanApplications(
        [ScopedService] ApplicationDbContext dbContext,
        AdminSearchInput? search)
    {
        var query = dbContext.LoanApplications
            .Include(la => la.User)
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .AsQueryable();
        
        if (search != null)
        {
            if (!string.IsNullOrEmpty(search.Status))
                query = query.Where(la => la.Status == search.Status);
                
            if (!string.IsNullOrEmpty(search.Search))
            {
                query = query.Where(la => 
                    la.User.FirstName.Contains(search.Search) ||
                    la.User.LastName.Contains(search.Search) ||
                    la.User.Email.Contains(search.Search) ||
                    la.Employer!.Contains(search.Search));
            }
        }
        
        return query;
    }
    
    // Mortgage Calculation Queries
    public async Task<DTOs.MortgageCalculationResultDto> CalculateMortgage(
        MortgageCalculationInput input,
        [Service] IMortgageService mortgageService)
    {
        var result = await mortgageService.CalculateMortgageAsync(new MortgagePlatform.API.DTOs.MortgageCalculationDto
        {
            PropertyPrice = input.PropertyPrice,
            DownPayment = input.DownPayment,
            InterestRate = input.InterestRate,
            LoanTermYears = input.LoanTermYears
        });
        
        return new DTOs.MortgageCalculationResultDto
        {
            MonthlyPayment = result.MonthlyPayment,
            TotalInterest = result.TotalInterest,
            TotalPayment = result.TotalPayment,
            LoanAmount = result.LoanAmount,
            AmortizationSchedule = result.AmortizationSchedule.Select(a => new DTOs.AmortizationScheduleItem
            {
                PaymentNumber = a.PaymentNumber,
                PaymentAmount = a.PaymentAmount,
                PrincipalAmount = a.PrincipalAmount,
                InterestAmount = a.InterestAmount,
                RemainingBalance = a.RemainingBalance
            }).ToArray()
        };
    }
    
    public async Task<DTOs.PreApprovalCheckDto> CheckPreApproval(
        PreApprovalCheckInput input,
        [Service] IMortgageService mortgageService)
    {
        var result = await mortgageService.CheckPreApprovalAsync(
            input.AnnualIncome,
            input.LoanAmount,
            input.MonthlyDebts);
        
        return result;
    }
    
    // Admin Queries - CRITICAL: Middleware order
    [Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<User> GetAllUsers(
        [ScopedService] ApplicationDbContext dbContext,
        AdminSearchInput? search)
    {
        var query = dbContext.Users.AsQueryable();
        
        if (search != null && !string.IsNullOrEmpty(search.Search))
        {
            query = query.Where(u => 
                u.FirstName.Contains(search.Search) ||
                u.LastName.Contains(search.Search) ||
                u.Email.Contains(search.Search));
        }
        
        return query;
    }
    
    [Authorize(Roles = new[] { "Admin" })]
    public async Task<DashboardMetricsDto> GetDashboardMetrics(
        [Service] ILoanService loanService,
        [Service] IAuthService authService,
        [ScopedService] ApplicationDbContext dbContext)
    {
        var totalApplications = await dbContext.LoanApplications.CountAsync();
        var pendingApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Pending");
        var approvedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Approved");
        var rejectedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Rejected");
        
        var approvalRate = totalApplications > 0 ? (decimal)approvedApplications / totalApplications * 100 : 0;
        
        var totalUsers = await dbContext.Users.CountAsync();
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var newUsersThisMonth = await dbContext.Users.CountAsync(u => u.CreatedAt >= startOfMonth);
        
        var recentApplications = await dbContext.LoanApplications
            .Include(la => la.User)
            .OrderByDescending(la => la.CreatedAt)
            .Take(10)
            .Select(la => new RecentApplicationDto(
                la.Id,
                $"{la.User.FirstName} {la.User.LastName}",
                la.LoanAmount,
                la.Status,
                la.CreatedAt
            ))
            .ToListAsync();
        
        return new DashboardMetricsDto(
            totalApplications,
            pendingApplications,
            approvedApplications,
            rejectedApplications,
            approvalRate,
            totalUsers,
            newUsersThisMonth,
            recentApplications
        );
    }
}
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

**CRITICAL: DbContextFactory Registration Order**
HotChocolate 13.x requires DbContextFactory to be registered before DbContext, or you'll get runtime errors.

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
    .AddTypeExtension<UserResolvers>()
    .AddTypeExtension<PropertyResolvers>()
    .AddTypeExtension<LoanApplicationResolvers>()
    .AddFiltering()
    .AddSorting()
    .AddProjections()
    .AddAuthorization()
    .AddHttpRequestInterceptor<GraphQLRequestInterceptor>()
    .ModifyRequestOptions(opt => 
    {
        opt.IncludeExceptionDetails = builder.Environment.IsDevelopment();
        opt.ExecutionTimeout = TimeSpan.FromMinutes(1);
    })
    .ModifyRequestOptions(opt =>
    {
        opt.IncludeExceptionDetails = builder.Environment.IsDevelopment();
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

// Development endpoints
if (app.Environment.IsDevelopment())
{
    // GraphQL schema endpoint - simplified for now
}

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
```

**CONTINUE AUTOMATICALLY** to Phase 3.

---

## ⚠️ CRITICAL RUNTIME FIXES SECTION (MUST READ)

### Common GraphQL Runtime Errors and Solutions

**🚨 Error 1: HotChocolate Middleware Pipeline Order Error**
```
The middleware pipeline order for the field `Query.properties` is invalid... 
Your order is: UseDbContext... -> UseFiltering -> UseSorting -> UsePaging
```
**Fix**: Use this EXACT middleware order:
```csharp
[UseDbContext(typeof(ApplicationDbContext))]
[UsePaging]
[UseFiltering]
[UseSorting]
```

**🚨 Error 2: DbContextFactory Registration Error**
```
No service for type 'Microsoft.EntityFrameworkCore.IDbContextFactory`1[ApplicationDbContext]' has been registered
```
**Fix**: Register DbContextFactory BEFORE DbContext in Program.cs:
```csharp
// Add both DbContext and DbContextFactory for HotChocolate 13.x
builder.Services.AddDbContextFactory<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));
```

**🚨 Error 3: Frontend Apollo Client 400 Bad Request**
This occurs when frontend GraphQL queries don't match the backend schema structure.

Common Issues:
1. Using `where:` parameter when it should be direct parameters
2. Missing required query structure for HotChocolate pagination
3. Incorrect field names that don't match backend DTOs

**Fix**: Ensure frontend queries match the exact backend schema structure generated by HotChocolate.

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
    properties(first: $first, after: $after) {
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
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
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

# Kill existing processes
lsof -ti:4300 | xargs kill -9 2>/dev/null || true
lsof -ti:5005 | xargs kill -9 2>/dev/null || true

# Start backend
echo "🔧 Starting GraphQL backend..."
cd backend-graphql/MortgagePlatform.API
dotnet restore > /dev/null 2>&1
nohup dotnet run > ../../backend.log 2>&1 &
cd ../..

# Wait for backend
echo "⏳ Waiting for backend..."
for i in {1..20}; do
    if curl -s http://localhost:5005/graphql > /dev/null 2>&1; then
        echo "✅ Backend ready!"
        break
    fi
    sleep 2
done

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm install --force > /dev/null 2>&1
nohup npm start > ../frontend.log 2>&1 &
cd ..

echo "🎉 Services starting..."
echo "📊 Frontend: http://localhost:4300"
echo "🔗 GraphQL: http://localhost:5005/graphql"
echo "🔑 Test: john.doe@email.com / user123"
```

### Step 4.2: Create README.md
```markdown
# LendPro GraphQL Migration

## Quick Start
```bash
./run-app.sh
```

## URLs
- Frontend: http://localhost:4300
- GraphQL: http://localhost:5005/graphql

## Test Accounts
- User: `john.doe@email.com` / `user123`
- Admin: `admin@mortgageplatform.com` / `admin123`

## Sample GraphQL Queries
```graphql
# Login
mutation { 
  login(input: { email: "john.doe@email.com", password: "user123" }) { 
    token user { firstName lastName } 
  } 
}

# Properties
query { 
  properties(first: 5) { 
    edges { 
      node { id address city price bedrooms bathrooms } 
    } 
  } 
}

# Locations
query { locations { states cities } }
```

## Tech Stack
- Backend: .NET 8 + HotChocolate + PostgreSQL
- Frontend: Angular + Apollo Client
```

### Step 4.3: Make Scripts Executable
```bash
chmod +x run-app.sh
```

---

## PHASE 5: VALIDATION

### Step 5.1: Build and Test
```bash
# Build backend
cd backend-graphql/MortgagePlatform.API
dotnet build

# Test GraphQL endpoint
curl -X POST http://localhost:5005/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { locations { states cities } }"}'
```

### Step 5.2: Runtime Checklist
- [ ] Backend starts without middleware errors
- [ ] GraphQL Playground accessible at http://localhost:5005/graphql
- [ ] Frontend connects without 400/500 errors
- [ ] Login/property search/mortgage calc work

---

## MIGRATION COMPLETE

**MIGRATION COMPLETE** - REST API successfully migrated to GraphQL with HotChocolate backend and Apollo Client frontend.

**URLs**: Frontend (4300), GraphQL (5005)  
**Test User**: john.doe@email.com / user123