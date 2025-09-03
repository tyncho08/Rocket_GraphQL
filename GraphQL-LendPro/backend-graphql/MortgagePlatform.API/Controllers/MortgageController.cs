using Microsoft.AspNetCore.Mvc;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Services;

namespace MortgagePlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MortgageController : ControllerBase
    {
        private readonly IMortgageService _mortgageService;

        public MortgageController(IMortgageService mortgageService)
        {
            _mortgageService = mortgageService;
        }

        [HttpPost("calculate")]
        public IActionResult CalculateMortgage([FromBody] MortgageCalculationDto calculation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = _mortgageService.CalculateMortgage(calculation);
            return Ok(result);
        }

        [HttpPost("preapproval")]
        public IActionResult CheckPreApproval([FromBody] PreApprovalCheckDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isEligible = _mortgageService.CheckPreApprovalEligibility(
                dto.AnnualIncome, dto.LoanAmount, dto.MonthlyDebts);

            return Ok(new { isEligible });
        }
    }

    public class PreApprovalCheckDto
    {
        public decimal AnnualIncome { get; set; }
        public decimal LoanAmount { get; set; }
        public decimal MonthlyDebts { get; set; }
    }
}