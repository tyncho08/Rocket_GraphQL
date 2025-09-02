using System.Threading.Tasks;
using MortgagePlatform.API.DTOs;

namespace MortgagePlatform.API.Services
{
    public interface IPropertyService
    {
        Task<PropertySearchResultDto> SearchPropertiesAsync(PropertySearchDto searchDto, int? userId = null);
        Task<PropertyDto> GetPropertyByIdAsync(int id, int? userId = null);
        Task<bool> ToggleFavoriteAsync(int propertyId, int userId);
        Task<PropertyDto[]> GetFavoritePropertiesAsync(int userId);
        Task<LocationsDto> GetLocationsAsync();
    }
}