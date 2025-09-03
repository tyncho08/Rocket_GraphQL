using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.DTOs
{
    public class MortgageCalculationDto
    {
        [Required]
        [Range(10000, 10000000)]
        public decimal PropertyPrice { get; set; }

        [Required]
        [Range(0, 1000000)]
        public decimal DownPayment { get; set; }

        [Required]
        [Range(0.01, 20)]
        public decimal InterestRate { get; set; }

        [Required]
        [Range(1, 50)]
        public int LoanTermYears { get; set; }
    }

    public class MortgageCalculationResultDto
    {
        public decimal MonthlyPayment { get; set; }
        public decimal TotalInterest { get; set; }
        public decimal TotalPayment { get; set; }
        public decimal LoanAmount { get; set; }
        public AmortizationScheduleItem[] AmortizationSchedule { get; set; }
    }

    public class AmortizationScheduleItem
    {
        public int PaymentNumber { get; set; }
        public decimal PaymentAmount { get; set; }
        public decimal PrincipalAmount { get; set; }
        public decimal InterestAmount { get; set; }
        public decimal RemainingBalance { get; set; }
    }
}