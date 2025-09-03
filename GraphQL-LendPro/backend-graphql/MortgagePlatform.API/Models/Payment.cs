using System;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.Models
{
    public class Payment
    {
        public int Id { get; set; }
        
        [Required]
        public int LoanApplicationId { get; set; }
        
        [Required]
        public decimal Amount { get; set; }
        
        [Required]
        public DateTime PaymentDate { get; set; }
        
        [Required]
        public DateTime DueDate { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Status { get; set; }
        
        [StringLength(50)]
        public string PaymentMethod { get; set; }
        
        [StringLength(100)]
        public string TransactionId { get; set; }
        
        public decimal PrincipalAmount { get; set; }
        
        public decimal InterestAmount { get; set; }
        
        public decimal RemainingBalance { get; set; }
        
        [StringLength(500)]
        public string Notes { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual LoanApplication LoanApplication { get; set; }
    }
}