using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.Models
{
    public class LoanApplication
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public decimal LoanAmount { get; set; }
        
        [Required]
        public decimal PropertyValue { get; set; }
        
        [Required]
        public decimal DownPayment { get; set; }
        
        [Required]
        public decimal InterestRate { get; set; }
        
        [Required]
        public int LoanTermYears { get; set; }
        
        [Required]
        public decimal AnnualIncome { get; set; }
        
        [StringLength(50)]
        public string EmploymentStatus { get; set; }
        
        [StringLength(100)]
        public string Employer { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";
        
        [StringLength(1000)]
        public string Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual User User { get; set; }
        public virtual ICollection<Document> Documents { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}