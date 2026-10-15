using Application.Services;
using Domain.Entities;
using Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using Xunit;

namespace PermissionService.Tests
{
    public class PermissionServiceTests
    {
        private readonly DbContextOptions<TimesheetDbContext> _dbOptions;
        private readonly IMemoryCache _memoryCache;

        public PermissionServiceTests()
        {
            _dbOptions = new DbContextOptionsBuilder<TimesheetDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _memoryCache = new MemoryCache(new MemoryCacheOptions());
        }

        private TimesheetDbContext CreateContext()
        {
            return new TimesheetDbContext(_dbOptions);
        }

        private Application.Services.PermissionService CreateService(TimesheetDbContext context)
        {
            return new Application.Services.PermissionService(context, _memoryCache);
        }

        [Fact]
        public async Task HasAccess_AdminUser_ReturnsTrue()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var adminUserId = "admin-user-1";
            var adminPermissionSet = new PermissionSet
            {
                Id = 1,
                Name = "Admin",
                Description = "System administrator",
                IsSystem = true,
                IsAssignable = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(adminPermissionSet);

            var userPermissionSet = new UserPermissionSet
            {
                UserId = adminUserId,
                PermissionSetId = adminPermissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            var api = new Api
            {
                Id = 1,
                Name = "Test.Api",
                Description = "Test API",
                Route = "/api/test",
                HttpMethod = "GET",
                Controller = "TestController",
                IsSensitive = false
            };
            context.Apis.Add(api);

            await context.SaveChangesAsync();

            // Act
            var result = await service.HasAccess(adminUserId, "/api/test", "GET");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HasAccess_NonAdminUser_SensitiveApi_WithoutProfile_ReturnsFalse()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var userId = "regular-user-1";
            
            var regularPermissionSet = new PermissionSet
            {
                Id = 2,
                Name = "Regular User",
                Description = "Regular user permissions",
                IsSystem = false,
                IsAssignable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(regularPermissionSet);

            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = regularPermissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            var sensitiveApi = new Api
            {
                Id = 2,
                Name = "Role.View",
                Description = "Can view roles",
                Route = "/api/permissions/roles",
                HttpMethod = "GET",
                Controller = "PermissionsController",
                IsSensitive = true
            };
            context.Apis.Add(sensitiveApi);

            var user = new ApplicationUser
            {
                Id = userId,
                UserName = "regularuser",
                Email = "regular@test.com",
                Profile = new Profile { ProfileId = 1, Name = "Regular", IsSystemAdmin = false }
            };
            context.Users.Add(user);

            await context.SaveChangesAsync();

            // Act
            var result = await service.HasAccess(userId, "/api/permissions/roles", "GET");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task HasAccess_NonAdminUser_SensitiveApi_WithSystemAdminProfile_ReturnsTrue()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var userId = "regular-user-2";
            
            var regularPermissionSet = new PermissionSet
            {
                Id = 3,
                Name = "Regular User",
                Description = "Regular user permissions",
                IsSystem = false,
                IsAssignable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(regularPermissionSet);

            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = regularPermissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            var sensitiveApi = new Api
            {
                Id = 3,
                Name = "Permission.View",
                Description = "Can view permissions",
                Route = "/api/permissions/apis",
                HttpMethod = "GET",
                Controller = "PermissionsController",
                IsSensitive = true
            };
            context.Apis.Add(sensitiveApi);

            var user = new ApplicationUser
            {
                Id = userId,
                UserName = "regularuser2",
                Email = "regular2@test.com",
                Profile = new Profile { ProfileId = 2, Name = "System Admin", IsSystemAdmin = true }
            };
            context.Users.Add(user);

            await context.SaveChangesAsync();

            // Act
            var result = await service.HasAccess(userId, "/api/permissions/apis", "GET");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HasAccess_UserWithPermissionSetGrantingApi_ReturnsTrue()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var userId = "user-with-permission-1";
            
            var permissionSet = new PermissionSet
            {
                Id = 4,
                Name = "Timesheet Access",
                Description = "Timesheet permissions",
                IsSystem = false,
                IsAssignable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(permissionSet);

            var api = new Api
            {
                Id = 4,
                Name = "Timesheet.View",
                Description = "Can view timesheets",
                Route = "/api/timesheets",
                HttpMethod = "GET",
                Controller = "TimesheetsController",
                IsSensitive = false
            };
            context.Apis.Add(api);

            var permissionSetApi = new PermissionSetApi
            {
                PermissionSetId = permissionSet.Id,
                ApiId = api.Id
            };
            context.PermissionSetApis.Add(permissionSetApi);

            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = permissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            await context.SaveChangesAsync();

            // Act
            var result = await service.HasAccess(userId, "/api/timesheets", "GET");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task HasAccess_UserWithoutPermissionSetForApi_ReturnsFalse()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var userId = "user-without-permission-1";
            
            var permissionSet = new PermissionSet
            {
                Id = 5,
                Name = "Limited Access",
                Description = "Limited permissions",
                IsSystem = false,
                IsAssignable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(permissionSet);

            // User has a permission set but it doesn't include the API we're testing
            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = permissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            // API that the user doesn't have access to
            var api = new Api
            {
                Id = 5,
                Name = "Project.Delete",
                Description = "Can delete projects",
                Route = "/api/projects/{id}",
                HttpMethod = "DELETE",
                Controller = "ProjectsController",
                IsSensitive = false
            };
            context.Apis.Add(api);

            // Different permission set with different API
            var otherApi = new Api
            {
                Id = 6,
                Name = "Timesheet.View",
                Description = "Can view timesheets",
                Route = "/api/timesheets",
                HttpMethod = "GET",
                Controller = "TimesheetsController",
                IsSensitive = false
            };
            context.Apis.Add(otherApi);

            var otherPermissionSetApi = new PermissionSetApi
            {
                PermissionSetId = permissionSet.Id,
                ApiId = otherApi.Id
            };
            context.PermissionSetApis.Add(otherPermissionSetApi);

            await context.SaveChangesAsync();

            // Act - try to access Project.Delete which the user doesn't have permission for
            var result = await service.HasAccess(userId, "/api/projects/1", "DELETE");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task HasAccess_ApiNotFound_ReturnsFalse()
        {
            // Arrange
            using var context = CreateContext();
            var service = CreateService(context);

            var userId = "user-1";
            
            var permissionSet = new PermissionSet
            {
                Id = 6,
                Name = "Test Access",
                Description = "Test permissions",
                IsSystem = false,
                IsAssignable = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.PermissionSets.Add(permissionSet);

            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = permissionSet.Id,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = "system"
            };
            context.UserPermissionSets.Add(userPermissionSet);

            await context.SaveChangesAsync();

            // Act - try to access an API that doesn't exist in the database
            var result = await service.HasAccess(userId, "/api/nonexistent", "GET");

            // Assert
            Assert.False(result);
        }
    }
}