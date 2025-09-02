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
    public class PropertiesController : ControllerBase
    {
        private readonly IPropertyService _propertyService;

        public PropertiesController(IPropertyService propertyService)
        {
            _propertyService = propertyService;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchProperties([FromQuery] PropertySearchDto searchDto)
        {
            int? userId = null;
            if (User.Identity.IsAuthenticated)
            {
                userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            }

            var result = await _propertyService.SearchPropertiesAsync(searchDto, userId);
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProperty(int id)
        {
            int? userId = null;
            if (User.Identity.IsAuthenticated)
            {
                userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            }

            var property = await _propertyService.GetPropertyByIdAsync(id, userId);
            if (property == null)
            {
                return NotFound();
            }

            return Ok(property);
        }

        [HttpPost("{id}/favorite")]
        [Authorize]
        public async Task<IActionResult> ToggleFavorite(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var isFavorite = await _propertyService.ToggleFavoriteAsync(id, userId);
            return Ok(new { isFavorite });
        }

        [HttpGet("favorites")]
        [Authorize]
        public async Task<IActionResult> GetFavorites()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var favorites = await _propertyService.GetFavoritePropertiesAsync(userId);
            return Ok(favorites);
        }

        [HttpGet("locations")]
        public async Task<IActionResult> GetLocations()
        {
            var locations = await _propertyService.GetLocationsAsync();
            return Ok(locations);
        }
    }
}