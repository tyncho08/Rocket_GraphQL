using System;
using System.Linq;
using MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.Services
{
    public class MortgageService : IMortgageService
    {
        public MortgageCalculationResultDto CalculateMortgage(MortgageCalculationDto calculation)
        {
            var loanAmount = calculation.PropertyPrice - calculation.DownPayment;
            var monthlyInterestRate = calculation.InterestRate / 100 / 12;
            var numberOfPayments = calculation.LoanTermYears * 12;

            var monthlyPayment = CalculateMonthlyPayment(loanAmount, monthlyInterestRate, numberOfPayments);
            var totalPayment = monthlyPayment * numberOfPayments;
            var totalInterest = totalPayment - loanAmount;

            var amortizationSchedule = GenerateAmortizationSchedule(
                loanAmount, monthlyInterestRate, numberOfPayments, monthlyPayment);

            return new MortgageCalculationResultDto
            {
                MonthlyPayment = Math.Round(monthlyPayment, 2),
                TotalInterest = Math.Round(totalInterest, 2),
                TotalPayment = Math.Round(totalPayment, 2),
                LoanAmount = loanAmount,
                AmortizationSchedule = amortizationSchedule
            };
        }

        public bool CheckPreApprovalEligibility(decimal annualIncome, decimal loanAmount, decimal monthlyDebts)
        {
            var monthlyIncome = annualIncome / 12;
            var estimatedMonthlyPayment = loanAmount * 0.005m; // Rough estimate at 6% for 30 years
            var totalMonthlyDebt = monthlyDebts + estimatedMonthlyPayment;
            var debtToIncomeRatio = totalMonthlyDebt / monthlyIncome;

            return debtToIncomeRatio <= 0.43m; // 43% DTI ratio threshold
        }

        private decimal CalculateMonthlyPayment(decimal loanAmount, decimal monthlyInterestRate, int numberOfPayments)
        {
            if (monthlyInterestRate == 0)
            {
                return loanAmount / numberOfPayments;
            }

            var monthlyPayment = loanAmount * 
                (monthlyInterestRate * (decimal)Math.Pow((double)(1 + monthlyInterestRate), numberOfPayments)) /
                ((decimal)Math.Pow((double)(1 + monthlyInterestRate), numberOfPayments) - 1);

            return monthlyPayment;
        }

        private AmortizationScheduleItem[] GenerateAmortizationSchedule(
            decimal loanAmount, decimal monthlyInterestRate, int numberOfPayments, decimal monthlyPayment)
        {
            var schedule = new AmortizationScheduleItem[numberOfPayments];
            var remainingBalance = loanAmount;

            for (int i = 0; i < numberOfPayments; i++)
            {
                var interestAmount = remainingBalance * monthlyInterestRate;
                var principalAmount = monthlyPayment - interestAmount;
                remainingBalance = Math.Max(0, remainingBalance - principalAmount);

                schedule[i] = new AmortizationScheduleItem
                {
                    PaymentNumber = i + 1,
                    PaymentAmount = Math.Round(monthlyPayment, 2),
                    PrincipalAmount = Math.Round(principalAmount, 2),
                    InterestAmount = Math.Round(interestAmount, 2),
                    RemainingBalance = Math.Round(remainingBalance, 2)
                };
            }

            return schedule;
        }
    }
}