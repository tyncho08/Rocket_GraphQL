using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.Services
{
    public class LoanService : ILoanService
    {
        private readonly ApplicationDbContext _context;

        public LoanService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LoanApplicationDto> CreateLoanApplicationAsync(CreateLoanApplicationDto dto, int userId)
        {
            var loanApplication = new LoanApplication
            {
                UserId = userId,
                LoanAmount = dto.LoanAmount,
                PropertyValue = dto.PropertyValue,
                DownPayment = dto.DownPayment,
                InterestRate = dto.InterestRate,
                LoanTermYears = dto.LoanTermYears,
                AnnualIncome = dto.AnnualIncome,
                EmploymentStatus = dto.EmploymentStatus,
                Employer = dto.Employer,
                Status = "Pending",
                Notes = dto.Notes
            };

            _context.LoanApplications.Add(loanApplication);
            await _context.SaveChangesAsync();

            return await GetLoanApplicationByIdAsync(loanApplication.Id);
        }

        public async Task<LoanApplicationDto> GetLoanApplicationByIdAsync(int id)
        {
            var loanApplication = await _context.LoanApplications
                .Include(l => l.User)
                .Where(l => l.Id == id)
                .Select(l => new LoanApplicationDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserName = $"{l.User.FirstName} {l.User.LastName}",
                    LoanAmount = l.LoanAmount,
                    PropertyValue = l.PropertyValue,
                    DownPayment = l.DownPayment,
                    InterestRate = l.InterestRate,
                    LoanTermYears = l.LoanTermYears,
                    AnnualIncome = l.AnnualIncome,
                    EmploymentStatus = l.EmploymentStatus,
                    Employer = l.Employer,
                    Status = l.Status,
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .FirstOrDefaultAsync();

            return loanApplication;
        }

        public async Task<LoanApplicationDto[]> GetLoanApplicationsByUserIdAsync(int userId)
        {
            var loanApplications = await _context.LoanApplications
                .Include(l => l.User)
                .Where(l => l.UserId == userId)
                .Select(l => new LoanApplicationDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserName = $"{l.User.FirstName} {l.User.LastName}",
                    LoanAmount = l.LoanAmount,
                    PropertyValue = l.PropertyValue,
                    DownPayment = l.DownPayment,
                    InterestRate = l.InterestRate,
                    LoanTermYears = l.LoanTermYears,
                    AnnualIncome = l.AnnualIncome,
                    EmploymentStatus = l.EmploymentStatus,
                    Employer = l.Employer,
                    Status = l.Status,
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .OrderByDescending(l => l.CreatedAt)
                .ToArrayAsync();

            return loanApplications;
        }

        public async Task<LoanApplicationDto[]> GetAllLoanApplicationsAsync()
        {
            var loanApplications = await _context.LoanApplications
                .Include(l => l.User)
                .Select(l => new LoanApplicationDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserName = $"{l.User.FirstName} {l.User.LastName}",
                    LoanAmount = l.LoanAmount,
                    PropertyValue = l.PropertyValue,
                    DownPayment = l.DownPayment,
                    InterestRate = l.InterestRate,
                    LoanTermYears = l.LoanTermYears,
                    AnnualIncome = l.AnnualIncome,
                    EmploymentStatus = l.EmploymentStatus,
                    Employer = l.Employer,
                    Status = l.Status,
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .OrderByDescending(l => l.CreatedAt)
                .ToArrayAsync();

            return loanApplications;
        }

        public async Task<object> GetAllLoanApplicationsWithPaginationAsync(int page, int limit, string status, string search)
        {
            var query = _context.LoanApplications.Include(l => l.User).AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(l => l.Status == status);
            }

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(l => l.User.FirstName.Contains(search) || 
                                        l.User.LastName.Contains(search) || 
                                        l.User.Email.Contains(search));
            }

            var totalCount = await query.CountAsync();

            var loanApplications = await query
                .Select(l => new LoanApplicationDto
                {
                    Id = l.Id,
                    UserId = l.UserId,
                    UserName = $"{l.User.FirstName} {l.User.LastName}",
                    LoanAmount = l.LoanAmount,
                    PropertyValue = l.PropertyValue,
                    DownPayment = l.DownPayment,
                    InterestRate = l.InterestRate,
                    LoanTermYears = l.LoanTermYears,
                    AnnualIncome = l.AnnualIncome,
                    EmploymentStatus = l.EmploymentStatus,
                    Employer = l.Employer,
                    Status = l.Status,
                    Notes = l.Notes,
                    CreatedAt = l.CreatedAt,
                    UpdatedAt = l.UpdatedAt
                })
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToArrayAsync();

            return new
            {
                Applications = loanApplications,
                TotalCount = totalCount,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling((double)totalCount / limit)
            };
        }

        public async Task<LoanApplicationDto> UpdateLoanApplicationStatusAsync(int id, UpdateLoanApplicationStatusDto dto)
        {
            var loanApplication = await _context.LoanApplications.FindAsync(id);
            if (loanApplication == null)
            {
                throw new ArgumentException("Loan application not found");
            }

            loanApplication.Status = dto.Status;
            loanApplication.Notes = dto.Notes ?? loanApplication.Notes;
            loanApplication.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetLoanApplicationByIdAsync(id);
        }
    }
}