using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using MortgagePlatform.API.Models;
using MortgagePlatform.API.Data;

namespace MortgagePlatform.API.GraphQL.Types;

public class UserType : ObjectType<User>
{
    protected override void Configure(IObjectTypeDescriptor<User> descriptor)
    {
        descriptor.Field(u => u.Id);
        descriptor.Field(u => u.FirstName);
        descriptor.Field(u => u.LastName);
        descriptor.Field(u => u.Email);
        descriptor.Field(u => u.Role);
        descriptor.Field(u => u.CreatedAt);
        descriptor.Field(u => u.UpdatedAt);
        
        // Hide password hash
        descriptor.Ignore(u => u.PasswordHash);
        
        // Add computed fields
        descriptor.Field("fullName")
            .Type<NonNullType<StringType>>()
            .Resolve(ctx => $"{ctx.Parent<User>().FirstName} {ctx.Parent<User>().LastName}");
        
        // Add related data
        descriptor.Field(u => u.LoanApplications)
            .UseDbContext<ApplicationDbContext>()
            .ResolveWith<UserResolvers>(r => r.GetLoanApplications(default!, default!))
            .UseFiltering()
            .UseSorting();
    }
}

public class UserResolvers
{
    public IQueryable<LoanApplication> GetLoanApplications(
        [Parent] User user,
        [Service(ServiceKind.Resolver)] ApplicationDbContext dbContext)
    {
        return dbContext.LoanApplications.Where(la => la.UserId == user.Id);
    }
}