using System;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.Models
{
    public class Document
    {
        public int Id { get; set; }
        
        [Required]
        public int LoanApplicationId { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileName { get; set; }
        
        [Required]
        [StringLength(500)]
        public string FilePath { get; set; }
        
        [Required]
        [StringLength(100)]
        public string DocumentType { get; set; }
        
        public long FileSize { get; set; }
        
        [StringLength(100)]
        public string ContentType { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        public virtual LoanApplication LoanApplication { get; set; }
    }
}