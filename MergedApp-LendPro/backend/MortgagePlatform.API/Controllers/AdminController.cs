using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard-metrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            var totalApplications = await _context.LoanApplications.CountAsync();
            var pendingApplications = await _context.LoanApplications.CountAsync(la => la.Status == "Pending");
            var approvedApplications = await _context.LoanApplications.CountAsync(la => la.Status == "Approved");
            var deniedApplications = await _context.LoanApplications.CountAsync(la => la.Status == "Denied");
            var totalUsers = await _context.Users.CountAsync();
            var newUsersThisMonth = await _context.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddMonths(-1));

            var recentApplications = await _context.LoanApplications
                .Include(la => la.User)
                .OrderByDescending(la => la.CreatedAt)
                .Take(5)
                .Select(la => new
                {
                    la.Id,
                    la.Status,
                    la.LoanAmount,
                    UserName = $"{la.User.FirstName} {la.User.LastName}",
                    la.CreatedAt
                })
                .ToListAsync();

            var metrics = new
            {
                TotalApplications = totalApplications,
                PendingApplications = pendingApplications,
                ApprovedApplications = approvedApplications,
                DeniedApplications = deniedApplications,
                TotalUsers = totalUsers,
                NewUsersThisMonth = newUsersThisMonth,
                RecentApplications = recentApplications,
                ApprovalRate = totalApplications > 0 ? (double)approvedApplications / totalApplications * 100 : 0
            };

            return Ok(metrics);
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string search = "")
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => u.FirstName.Contains(search) || u.LastName.Contains(search) || u.Email.Contains(search));
            }

            var totalUsers = await query.CountAsync();
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role,
                    u.CreatedAt,
                    u.UpdatedAt,
                    LoanApplicationsCount = u.LoanApplications.Count()
                })
                .ToListAsync();

            return Ok(new
            {
                Users = users,
                TotalCount = totalUsers,
                Page = page,
                Limit = limit,
                TotalPages = (int)Math.Ceiling((double)totalUsers / limit)
            });
        }

        [HttpPut("users/{id}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            user.Role = dto.Role;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                user.Id,
                user.FirstName,
                user.LastName,
                user.Email,
                user.Role,
                user.UpdatedAt
            });
        }
    }

    public class UpdateUserRoleDto
    {
        public string Role { get; set; }
    }
}