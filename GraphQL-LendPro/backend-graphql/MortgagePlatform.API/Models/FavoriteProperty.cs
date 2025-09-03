using System;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.Models
{
    public class FavoriteProperty
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int PropertyId { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public virtual User User { get; set; }
        public virtual Property Property { get; set; }
    }
}