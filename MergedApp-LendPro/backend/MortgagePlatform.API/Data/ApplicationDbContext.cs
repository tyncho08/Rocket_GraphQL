using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Property> Properties { get; set; }
        public DbSet<LoanApplication> LoanApplications { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<FavoriteProperty> FavoriteProperties { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Role).HasDefaultValue("User");
            });

            modelBuilder.Entity<Property>(entity =>
            {
                entity.Property(e => e.Price).HasColumnType("decimal(18,2)");
                entity.HasIndex(e => new { e.City, e.State });
                entity.HasIndex(e => e.Price);
            });

            modelBuilder.Entity<LoanApplication>(entity =>
            {
                entity.Property(e => e.LoanAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PropertyValue).HasColumnType("decimal(18,2)");
                entity.Property(e => e.DownPayment).HasColumnType("decimal(18,2)");
                entity.Property(e => e.InterestRate).HasColumnType("decimal(5,4)");
                entity.Property(e => e.AnnualIncome).HasColumnType("decimal(18,2)");

                entity.HasOne(d => d.User)
                    .WithMany(p => p.LoanApplications)
                    .HasForeignKey(d => d.UserId);
            });

            modelBuilder.Entity<Document>(entity =>
            {
                entity.HasOne(d => d.LoanApplication)
                    .WithMany(p => p.Documents)
                    .HasForeignKey(d => d.LoanApplicationId);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.PrincipalAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.InterestAmount).HasColumnType("decimal(18,2)");
                entity.Property(e => e.RemainingBalance).HasColumnType("decimal(18,2)");

                entity.HasOne(d => d.LoanApplication)
                    .WithMany(p => p.Payments)
                    .HasForeignKey(d => d.LoanApplicationId);
            });

            modelBuilder.Entity<FavoriteProperty>(entity =>
            {
                entity.HasOne(d => d.User)
                    .WithMany(p => p.FavoriteProperties)
                    .HasForeignKey(d => d.UserId);

                entity.HasOne(d => d.Property)
                    .WithMany(p => p.FavoriteProperties)
                    .HasForeignKey(d => d.PropertyId);

                entity.HasIndex(e => new { e.UserId, e.PropertyId }).IsUnique();
            });
        }
    }
}