using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Services;

namespace MortgagePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LoansController : ControllerBase
    {
        private readonly ILoanService _loanService;

        public LoansController(ILoanService loanService)
        {
            _loanService = loanService;
        }

        // User endpoints
        [HttpPost]
        public async Task<IActionResult> CreateLoanApplication([FromBody] CreateLoanApplicationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _loanService.CreateLoanApplicationAsync(dto, userId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLoanApplication(int id)
        {
            var loanApplication = await _loanService.GetLoanApplicationByIdAsync(id);
            if (loanApplication == null)
            {
                return NotFound();
            }

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            // Allow access if user is owner or admin
            if (loanApplication.UserId != userId && userRole != "Admin")
            {
                return Forbid();
            }

            return Ok(loanApplication);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyLoanApplications()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var loanApplications = await _loanService.GetLoanApplicationsByUserIdAsync(userId);
            return Ok(loanApplications);
        }

        // Admin endpoints
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllLoanApplications([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string status = "", [FromQuery] string search = "")
        {
            var loanApplications = await _loanService.GetAllLoanApplicationsWithPaginationAsync(page, limit, status, search);
            return Ok(loanApplications);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateLoanApplicationStatus(int id, [FromBody] UpdateLoanApplicationStatusDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var result = await _loanService.UpdateLoanApplicationStatusAsync(id, dto);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}