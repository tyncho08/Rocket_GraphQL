using HotChocolate.AspNetCore;
using HotChocolate.Execution;
using System.Security.Claims;

namespace MortgagePlatform.API.GraphQL.Extensions;

public class GraphQLRequestInterceptor : DefaultHttpRequestInterceptor
{
    public override ValueTask OnCreateAsync(
        HttpContext context,
        IRequestExecutor requestExecutor,
        IQueryRequestBuilder requestBuilder,
        CancellationToken cancellationToken)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value ?? "User";
            
            if (!string.IsNullOrEmpty(userId) && int.TryParse(userId, out var id))
            {
                requestBuilder.SetGlobalState("UserId", id);
                requestBuilder.SetGlobalState("UserRole", userRole);
            }
        }
        
        return base.OnCreateAsync(context, requestExecutor, requestBuilder, cancellationToken);
    }
}