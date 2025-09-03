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

public record AdminSearchInput(
    string? Search,
    string? Status
);