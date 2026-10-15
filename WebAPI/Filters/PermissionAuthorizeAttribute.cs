using Application.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace WebAPI.Filters
{
    public class PermissionAuthorizeAttribute : TypeFilterAttribute
    {
        public PermissionAuthorizeAttribute(string apiRoute, string httpMethod) : base(typeof(PermissionAuthorizeFilter))
        {
            Arguments = new object[] { apiRoute, httpMethod };
        }

        private class PermissionAuthorizeFilter : IAsyncAuthorizationFilter
        {
            private readonly IPermissionService _permissionService;
            private readonly string _apiRoute;
            private readonly string _httpMethod;

            public PermissionAuthorizeFilter(IPermissionService permissionService, string apiRoute, string httpMethod)
            {
                _permissionService = permissionService;
                _apiRoute = apiRoute;
                _httpMethod = httpMethod;
            }

            public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
            {
                var userId = context.HttpContext.User.FindFirst("uid")?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    context.Result = new UnauthorizedResult();
                    return;
                }

                var hasAccess = await _permissionService.HasAccess(userId, _apiRoute, _httpMethod);
                if (!hasAccess)
                {
                    context.Result = new ForbidResult();
                }
            }
        }
    }
}