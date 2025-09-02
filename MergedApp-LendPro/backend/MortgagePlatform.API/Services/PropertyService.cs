using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Data;
using MortgagePlatform.API.DTOs;
using MortgagePlatform.API.Models;

namespace MortgagePlatform.API.Services
{
    public class PropertyService : IPropertyService
    {
        private readonly ApplicationDbContext _context;

        public PropertyService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PropertySearchResultDto> SearchPropertiesAsync(PropertySearchDto searchDto, int? userId = null)
        {
            var query = _context.Properties.Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(searchDto.City))
            {
                query = query.Where(p => p.City.ToLower().Contains(searchDto.City.ToLower()));
            }

            if (!string.IsNullOrEmpty(searchDto.State))
            {
                query = query.Where(p => p.State.ToLower() == searchDto.State.ToLower());
            }

            if (searchDto.MinPrice.HasValue)
            {
                query = query.Where(p => p.Price >= searchDto.MinPrice.Value);
            }

            if (searchDto.MaxPrice.HasValue)
            {
                query = query.Where(p => p.Price <= searchDto.MaxPrice.Value);
            }

            if (searchDto.MinBedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms >= searchDto.MinBedrooms.Value);
            }

            if (searchDto.MaxBedrooms.HasValue)
            {
                query = query.Where(p => p.Bedrooms <= searchDto.MaxBedrooms.Value);
            }

            if (searchDto.MinBathrooms.HasValue)
            {
                query = query.Where(p => p.Bathrooms >= searchDto.MinBathrooms.Value);
            }

            if (searchDto.MaxBathrooms.HasValue)
            {
                query = query.Where(p => p.Bathrooms <= searchDto.MaxBathrooms.Value);
            }

            if (!string.IsNullOrEmpty(searchDto.PropertyType))
            {
                query = query.Where(p => p.PropertyType.ToLower() == searchDto.PropertyType.ToLower());
            }

            // Apply distinct to prevent duplicates (remove this as it may not work properly with complex queries)
            // query = query.Distinct();

            switch (searchDto.SortBy?.ToLower())
            {
                case "price":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(p => p.Price) 
                        : query.OrderByDescending(p => p.Price);
                    break;
                case "bedrooms":
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(p => p.Bedrooms) 
                        : query.OrderByDescending(p => p.Bedrooms);
                    break;
                case "random":
                    // Use Id for pseudo-random ordering since true random is complex with EF Core
                    query = query.OrderBy(p => p.Id);
                    break;
                default:
                    query = searchDto.SortOrder?.ToLower() == "asc" 
                        ? query.OrderBy(p => p.ListedDate) 
                        : query.OrderByDescending(p => p.ListedDate);
                    break;
            }

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / searchDto.PageSize);

            var properties = await query
                .Skip((searchDto.Page - 1) * searchDto.PageSize)
                .Take(searchDto.PageSize)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    City = p.City,
                    State = p.State,
                    ZipCode = p.ZipCode,
                    Price = p.Price,
                    Bedrooms = p.Bedrooms,
                    Bathrooms = p.Bathrooms,
                    SquareFeet = p.SquareFeet,
                    PropertyType = p.PropertyType,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = userId.HasValue && p.FavoriteProperties.Any(f => f.UserId == userId.Value)
                })
                .ToArrayAsync();

            return new PropertySearchResultDto
            {
                Properties = properties,
                TotalCount = totalCount,
                Page = searchDto.Page,
                PageSize = searchDto.PageSize,
                TotalPages = totalPages
            };
        }

        public async Task<PropertyDto> GetPropertyByIdAsync(int id, int? userId = null)
        {
            var property = await _context.Properties
                .Where(p => p.Id == id && p.IsActive)
                .Select(p => new PropertyDto
                {
                    Id = p.Id,
                    Address = p.Address,
                    City = p.City,
                    State = p.State,
                    ZipCode = p.ZipCode,
                    Price = p.Price,
                    Bedrooms = p.Bedrooms,
                    Bathrooms = p.Bathrooms,
                    SquareFeet = p.SquareFeet,
                    PropertyType = p.PropertyType,
                    Description = p.Description,
                    ImageUrl = p.ImageUrl,
                    IsFavorite = userId.HasValue && p.FavoriteProperties.Any(f => f.UserId == userId.Value)
                })
                .FirstOrDefaultAsync();

            return property;
        }

        public async Task<bool> ToggleFavoriteAsync(int propertyId, int userId)
        {
            var existingFavorite = await _context.FavoriteProperties
                .FirstOrDefaultAsync(f => f.PropertyId == propertyId && f.UserId == userId);

            if (existingFavorite != null)
            {
                _context.FavoriteProperties.Remove(existingFavorite);
                await _context.SaveChangesAsync();
                return false;
            }
            else
            {
                var favorite = new FavoriteProperty
                {
                    PropertyId = propertyId,
                    UserId = userId
                };
                _context.FavoriteProperties.Add(favorite);
                await _context.SaveChangesAsync();
                return true;
            }
        }

        public async Task<PropertyDto[]> GetFavoritePropertiesAsync(int userId)
        {
            var favorites = await _context.FavoriteProperties
                .Where(f => f.UserId == userId)
                .Include(f => f.Property)
                .Select(f => new PropertyDto
                {
                    Id = f.Property.Id,
                    Address = f.Property.Address,
                    City = f.Property.City,
                    State = f.Property.State,
                    ZipCode = f.Property.ZipCode,
                    Price = f.Property.Price,
                    Bedrooms = f.Property.Bedrooms,
                    Bathrooms = f.Property.Bathrooms,
                    SquareFeet = f.Property.SquareFeet,
                    PropertyType = f.Property.PropertyType,
                    Description = f.Property.Description,
                    ImageUrl = f.Property.ImageUrl,
                    IsFavorite = true
                })
                .ToArrayAsync();

            return favorites;
        }

        public async Task<LocationsDto> GetLocationsAsync()
        {
            var states = await _context.Properties
                .Where(p => p.IsActive)
                .Select(p => p.State)
                .Distinct()
                .OrderBy(s => s)
                .ToArrayAsync();

            var cities = await _context.Properties
                .Where(p => p.IsActive)
                .Select(p => p.City)
                .Distinct()
                .OrderBy(c => c)
                .ToArrayAsync();

            return new LocationsDto
            {
                States = states,
                Cities = cities
            };
        }
    }
}