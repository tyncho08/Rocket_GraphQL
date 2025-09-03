using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace MortgagePlatform.API.Models
{
    public class Property
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(500)]
        public string Address { get; set; }
        
        [Required]
        [StringLength(100)]
        public string City { get; set; }
        
        [Required]
        [StringLength(100)]
        public string State { get; set; }
        
        [Required]
        [StringLength(10)]
        public string ZipCode { get; set; }
        
        [Required]
        public decimal Price { get; set; }
        
        public int Bedrooms { get; set; }
        
        public int Bathrooms { get; set; }
        
        public int SquareFeet { get; set; }
        
        [StringLength(50)]
        public string PropertyType { get; set; }
        
        [StringLength(2000)]
        public string Description { get; set; }
        
        [StringLength(500)]
        public string ImageUrl { get; set; }
        
        public DateTime ListedDate { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
        
        public virtual ICollection<FavoriteProperty> FavoriteProperties { get; set; }
    }
}