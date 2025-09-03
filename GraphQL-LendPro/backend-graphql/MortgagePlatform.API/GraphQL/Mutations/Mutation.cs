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
                
            var token = await authService.RegisterAsync(new RegisterDto
            {
                FirstName = input.FirstName,
                LastName = input.LastName,
                Email = input.Email,
                Password = input.Password,
                ConfirmPassword = input.ConfirmPassword
            });
            
            var user = await authService.GetUserByEmailAsync(input.Email);
            
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
        [Service] IPropertyService propertyService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            var isFavorite = await propertyService.ToggleFavoriteAsync(propertyId, userId);
            var property = await dbContext.Properties.FirstOrDefaultAsync(p => p.Id == propertyId);
            
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
        [Service] ILoanService loanService)
    {
        try
        {
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
            
            // Convert DTO to Model for GraphQL response
            var model = new LoanApplication
            {
                Id = loanApp.Id,
                UserId = loanApp.UserId,
                LoanAmount = loanApp.LoanAmount,
                PropertyValue = loanApp.PropertyValue,
                DownPayment = loanApp.DownPayment,
                InterestRate = loanApp.InterestRate,
                LoanTermYears = loanApp.LoanTermYears,
                AnnualIncome = loanApp.AnnualIncome,
                EmploymentStatus = loanApp.EmploymentStatus,
                Employer = loanApp.Employer,
                Status = loanApp.Status,
                Notes = loanApp.Notes,
                CreatedAt = loanApp.CreatedAt,
                UpdatedAt = loanApp.UpdatedAt
            };
            
            return new LoanApplicationPayload(model, null);
        }
        catch (Exception ex)
        {
            return new LoanApplicationPayload(null, new[] { new UserError(ex.Message, "LOAN_ERROR") });
        }
    }
    
    [Authorize(Roles = new[] { "Admin" })]
    public async Task<LoanApplicationPayload> UpdateLoanApplicationStatus(
        UpdateLoanStatusInput input,
        [Service] ILoanService loanService,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        try
        {
            var loanAppDto = await loanService.UpdateLoanApplicationStatusAsync(
                input.LoanApplicationId,
                new UpdateLoanApplicationStatusDto
                {
                    Status = input.Status,
                    Notes = input.Notes
                });
                
            // Get the updated model from database for GraphQL response
            var model = await dbContext.LoanApplications
                .Include(la => la.User)
                .Include(la => la.Documents)
                .Include(la => la.Payments)
                .FirstOrDefaultAsync(la => la.Id == input.LoanApplicationId);
                
            return new LoanApplicationPayload(model, null);
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