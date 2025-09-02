using System;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.DTOs
{
    public class CreateLoanApplicationDto
    {
        [Required]
        [Range(10000, 10000000)]
        public decimal LoanAmount { get; set; }

        [Required]
        [Range(10000, 10000000)]
        public decimal PropertyValue { get; set; }

        [Required]
        [Range(0, 1000000)]
        public decimal DownPayment { get; set; }

        [Required]
        [Range(0.01, 20)]
        public decimal InterestRate { get; set; }

        [Required]
        [Range(1, 50)]
        public int LoanTermYears { get; set; }

        [Required]
        [Range(1, 10000000)]
        public decimal AnnualIncome { get; set; }

        [Required]
        [StringLength(50)]
        public string EmploymentStatus { get; set; }

        [StringLength(100)]
        public string Employer { get; set; }

        [StringLength(1000)]
        public string Notes { get; set; }
    }

    public class LoanApplicationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal PropertyValue { get; set; }
        public decimal DownPayment { get; set; }
        public decimal InterestRate { get; set; }
        public int LoanTermYears { get; set; }
        public decimal AnnualIncome { get; set; }
        public string EmploymentStatus { get; set; }
        public string Employer { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UpdateLoanApplicationStatusDto
    {
        [Required]
        [StringLength(50)]
        public string Status { get; set; }

        [StringLength(1000)]
        public string Notes { get; set; }
    }
}