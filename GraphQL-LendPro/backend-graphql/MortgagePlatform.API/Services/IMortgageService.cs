using MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.Services
{
    public interface IMortgageService
    {
        MortgageCalculationResultDto CalculateMortgage(MortgageCalculationDto calculation);
        bool CheckPreApprovalEligibility(decimal annualIncome, decimal loanAmount, decimal monthlyDebts);
    }
}