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

// Dashboard DTOs
public record DashboardMetricsDto(
    int TotalApplications,
    int PendingApplications,
    int ApprovedApplications,
    int RejectedApplications,
    decimal ApprovalRate,
    int TotalUsers,
    int NewUsersThisMonth,
    IReadOnlyList<RecentApplicationDto> RecentApplications
);

public record RecentApplicationDto(
    int Id,
    string UserName,
    decimal LoanAmount,
    string Status,
    DateTime CreatedAt
);

public record PreApprovalResultDto(bool IsEligible);

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
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
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
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == id && p.IsActive);
    }
    
    [Authorize]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UseFiltering]
    [UseSorting]
    public IQueryable<Property> GetFavoriteProperties(
        [GlobalState("UserId")] int userId,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return dbContext.FavoriteProperties
            .Where(fp => fp.UserId == userId)
            .Select(fp => fp.Property)
            .Where(p => p.IsActive);
    }
    
    [UseDbContext(typeof(ApplicationDbContext))]
    public async Task<DTOs.LocationsDto> GetLocations(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
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
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
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
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        var loan = await dbContext.LoanApplications
            .Include(la => la.User)
            .Include(la => la.Documents)
            .Include(la => la.Payments)
            .FirstOrDefaultAsync(la => la.Id == id);
        
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
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
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
    public DTOs.MortgageCalculationResultDto CalculateMortgage(
        MortgageCalculationInput input,
        [Service] IMortgageService mortgageService)
    {
        var result = mortgageService.CalculateMortgage(new MortgagePlatform.API.DTOs.MortgageCalculationDto
        {
            PropertyPrice = input.PropertyPrice,
            DownPayment = input.DownPayment,
            InterestRate = input.InterestRate,
            LoanTermYears = input.LoanTermYears
        });
        
        return result;
    }
    
    public PreApprovalResultDto CheckPreApproval(
        PreApprovalCheckInput input,
        [Service] IMortgageService mortgageService)
    {
        var isEligible = mortgageService.CheckPreApprovalEligibility(
            input.AnnualIncome,
            input.LoanAmount,
            input.MonthlyDebts);
        
        return new PreApprovalResultDto(isEligible);
    }
    
    // Admin Queries - CRITICAL: Middleware order
    [Authorize(Roles = new[] { "Admin" })]
    [UseDbContext(typeof(ApplicationDbContext))]
    [UsePaging]
    [UseFiltering]
    [UseSorting]
    public IQueryable<User> GetAllUsers(
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext,
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
        [Service] IDbContextFactory<ApplicationDbContext> dbContextFactory)
    {
        using var dbContext = await dbContextFactory.CreateDbContextAsync();
        
        var totalApplications = await dbContext.LoanApplications.CountAsync();
        var pendingApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Pending");
        var approvedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Approved");
        var rejectedApplications = await dbContext.LoanApplications.CountAsync(la => la.Status == "Rejected");
        
        var approvalRate = totalApplications > 0 ? (decimal)approvedApplications / totalApplications * 100 : 0;
        
        var totalUsers = await dbContext.Users.CountAsync();
        var utcNow = DateTime.UtcNow;
        var startOfMonth = new DateTime(utcNow.Year, utcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
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