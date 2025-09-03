using HotChocolate.Types;
using Microsoft.EntityFrameworkCore;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.GraphQL.Types;

public class PropertyType : ObjectType<Property>
{
    protected override void Configure(IObjectTypeDescriptor<Property> descriptor)
    {
        descriptor.Field(p => p.Id);
        descriptor.Field(p => p.Address);
        descriptor.Field(p => p.City);
        descriptor.Field(p => p.State);
        descriptor.Field(p => p.ZipCode);
        descriptor.Field(p => p.Price);
        descriptor.Field(p => p.Bedrooms);
        descriptor.Field(p => p.Bathrooms);
        descriptor.Field(p => p.SquareFeet);
        descriptor.Field(p => p.PropertyType);
        descriptor.Field(p => p.Description);
        descriptor.Field(p => p.ImageUrl);
        descriptor.Field(p => p.ListedDate);
        descriptor.Field(p => p.IsActive);
        
        descriptor.Field("isFavorite")
            .Type<NonNullType<BooleanType>>()
            .Resolve(async ctx =>
            {
                // Check if user is authenticated - return false if not
                if (!ctx.ContextData.TryGetValue("UserId", out var userIdObj) || userIdObj is not int userId)
                {
                    return false;
                }
                
                // Use DbContextFactory to avoid concurrency issues
                var dbContextFactory = ctx.Service<IDbContextFactory<ApplicationDbContext>>();
                using var dbContext = await dbContextFactory.CreateDbContextAsync();
                
                return await dbContext.FavoriteProperties.AnyAsync(fp => 
                    fp.PropertyId == ctx.Parent<Property>().Id && 
                    fp.UserId == userId);
            });
    }
}