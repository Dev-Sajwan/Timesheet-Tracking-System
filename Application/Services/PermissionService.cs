using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IPermissionService
    {
        Task<IEnumerable<Api>> GetAllApisAsync();
        Task<IEnumerable<Permission>> GetAllPermissionsAsync();
        Task<Permission> CreatePermissionAsync(string name, string description, List<int> apiIds, bool isSensitive);
        Task<Permission> UpdatePermissionAsync(int id, string name, string description, List<int> apiIds, bool isSensitive);
        Task DeletePermissionAsync(int id);

        Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync();
        Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> permissionIds);
        Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> permissionIds);
        Task DeletePermissionSetAsync(int id);

        Task<List<string>> GetUserPermissionsAsync(string userId);
        Task<bool> HasAccess(string userId, string apiRoute, string httpMethod);

        Task AssignPermissionToUserAsync(string userId, int permissionId, string assignedBy);
        Task UnassignPermissionFromUserAsync(string userId, int permissionId);
        Task AssignPermissionSetToUserAsync(string userId, int permissionSetId, string assignedBy);
        Task UnassignPermissionSetFromUserAsync(string userId, int permissionSetId);

        Task<IEnumerable<Profile>> GetAllProfilesAsync();
        Task<Profile> CreateProfileAsync(string name, string description, bool isSystemAdmin);
        Task<Profile> UpdateProfileAsync(int id, string name, string description, bool isSystemAdmin);
        Task DeleteProfileAsync(int id);
        Task AssignProfileToUserAsync(string userId, int? profileId);
        Task<Profile?> GetUserProfileAsync(string userId);
    }

    public class PermissionService : IPermissionService
    {
        private readonly ITimesheetDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly TimeSpan _cacheExpiration = TimeSpan.FromMinutes(5);

        public PermissionService(ITimesheetDbContext context, IMemoryCache cache)
        {
            _context = context;
            _cache = cache;
        }

        public async Task<IEnumerable<Api>> GetAllApisAsync()
        {
            return await _cache.GetOrCreateAsync("all_apis", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;
                return await _context.Apis.ToListAsync();
            });
        }

        public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _cache.GetOrCreateAsync("all_permissions", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;
                return await _context.Permissions
                    .Include(p => p.PermissionApis)
                        .ThenInclude(pa => pa.Api)
                    .ToListAsync();
            });
        }

        public async Task<Permission> CreatePermissionAsync(string name, string description, List<int> apiIds, bool isSensitive)
        {
            var permission = new Permission
            {
                Name = name,
                Description = description,
                IsSensitive = isSensitive
            };

            var apis = await _context.Apis.Where(a => apiIds.Contains(a.Id)).ToListAsync();
            foreach (var api in apis)
            {
                permission.PermissionApis.Add(new PermissionApi { Api = api });
            }

            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return permission;
        }

        public async Task<Permission> UpdatePermissionAsync(int id, string name, string description, List<int> apiIds, bool isSensitive)
        {
            var permission = await _context.Permissions
                .Include(p => p.PermissionApis)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (permission == null) return null;

            permission.Name = name;
            permission.Description = description;
            permission.IsSensitive = isSensitive;

            _context.PermissionApis.RemoveRange(permission.PermissionApis);

            var apis = await _context.Apis.Where(a => apiIds.Contains(a.Id)).ToListAsync();
            foreach (var api in apis)
            {
                permission.PermissionApis.Add(new PermissionApi { Api = api });
            }

            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return permission;
        }

        public async Task DeletePermissionAsync(int id)
        {
            var permission = await _context.Permissions
                .Include(p => p.PermissionApis)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (permission != null)
            {
                _context.PermissionApis.RemoveRange(permission.PermissionApis);
                _context.Permissions.Remove(permission);
                await _context.SaveChangesAsync();
                InvalidatePermissionCache();
            }
        }

        public async Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync()
        {
            return await _cache.GetOrCreateAsync("all_permission_sets", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;
                return await _context.PermissionSets
                    .Include(ps => ps.PermissionSetPermissions)
                        .ThenInclude(psp => psp.Permission)
                            .ThenInclude(p => p.PermissionApis)
                                .ThenInclude(pa => pa.Api)
                    .ToListAsync();
            });
        }

        public async Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> permissionIds)
        {
            var ps = new PermissionSet { Name = name, Description = description };
            var permissions = await _context.Permissions.Where(p => permissionIds.Contains(p.Id)).ToListAsync();
            foreach (var perm in permissions)
            {
                ps.PermissionSetPermissions.Add(new PermissionSetPermission { Permission = perm });
            }
            _context.PermissionSets.Add(ps);
            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return ps;
        }

        public async Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> permissionIds)
        {
            var ps = await _context.PermissionSets
                .Include(x => x.PermissionSetPermissions)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (ps == null) return null;

            ps.Name = name;
            ps.Description = description;

            _context.PermissionSetPermissions.RemoveRange(ps.PermissionSetPermissions);

            var permissions = await _context.Permissions.Where(p => permissionIds.Contains(p.Id)).ToListAsync();
            foreach (var perm in permissions)
            {
                ps.PermissionSetPermissions.Add(new PermissionSetPermission { Permission = perm });
            }

            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return ps;
        }

        public async Task DeletePermissionSetAsync(int id)
        {
            var ps = await _context.PermissionSets.Include(ps => ps.PermissionSetPermissions).FirstOrDefaultAsync(x => x.Id == id);
            if (ps != null)
            {
                _context.PermissionSetPermissions.RemoveRange(ps.PermissionSetPermissions);
                _context.PermissionSets.Remove(ps);
                await _context.SaveChangesAsync();
                InvalidatePermissionCache();
            }
        }

        public async Task<List<string>> GetUserPermissionsAsync(string userId)
        {
            var cacheKey = $"user_permissions_{userId}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;
                
                var permissionNames = new List<string>();

                // Get direct permission assignments
                var userPermissions = await _context.UserPermissions
                    .Include(up => up.Permission)
                        .ThenInclude(p => p.PermissionApis)
                            .ThenInclude(pa => pa.Api)
                    .Where(up => up.UserId == userId)
                    .ToListAsync();

                foreach (var up in userPermissions)
                {
                    permissionNames.Add(up.Permission.Name);
                }

                // Get permission sets assigned to the user
                var userPermissionSets = await _context.UserPermissionSets
                    .Include(ups => ups.PermissionSet)
                        .ThenInclude(ps => ps.PermissionSetPermissions)
                            .ThenInclude(psp => psp.Permission)
                                .ThenInclude(p => p.PermissionApis)
                                    .ThenInclude(pa => pa.Api)
                    .Where(ups => ups.UserId == userId)
                    .ToListAsync();

                foreach (var ups in userPermissionSets)
                {
                    permissionNames.AddRange(ups.PermissionSet.PermissionSetPermissions.Select(psp => psp.Permission.Name));
                }

                // If user has System Admin profile, they get all permissions
                var hasAdminProfile = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Profile)
                    .AnyAsync(p => p != null && p.IsSystemAdmin);

                if (hasAdminProfile)
                {
                    var allPermissions = await _context.Permissions.Select(p => p.Name).ToListAsync();
                    permissionNames.AddRange(allPermissions);
                }

                return permissionNames.Distinct().ToList();
            });
        }

        public async Task<bool> HasAccess(string userId, string apiRoute, string httpMethod)
        {
            var cacheKey = $"has_access_{userId}_{apiRoute}_{httpMethod}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;

                // 1. Check if user has System Admin profile - gets all access
                var hasAdminProfile = await _context.Users
                    .Where(u => u.Id == userId)
                    .Select(u => u.Profile)
                    .AnyAsync(p => p != null && p.IsSystemAdmin);
                if (hasAdminProfile)
                {
                    return true;
                }

                // 2. Look up the API. If it is not found, return false.
                var api = await _context.Apis
                    .FirstOrDefaultAsync(a => a.Route == apiRoute && a.HttpMethod == httpMethod);
                if (api == null)
                {
                    return false;
                }

                // 3. Check if user has direct permission that includes this API
                var hasDirectPermission = await _context.UserPermissions
                    .Include(up => up.Permission)
                        .ThenInclude(p => p.PermissionApis)
                    .AnyAsync(up => up.UserId == userId && 
                                     up.Permission.PermissionApis.Any(pa => pa.ApiId == api.Id));
                if (hasDirectPermission)
                {
                    return true;
                }

                // 4. Check if user has permission set that contains permission for this API
                var hasPermissionSetAccess = await _context.UserPermissionSets
                    .Include(ups => ups.PermissionSet)
                        .ThenInclude(ps => ps.PermissionSetPermissions)
                            .ThenInclude(psp => psp.Permission)
                                .ThenInclude(p => p.PermissionApis)
                    .AnyAsync(ups => ups.UserId == userId && 
                                     ups.PermissionSet.PermissionSetPermissions.Any(psp => 
                                         psp.Permission.PermissionApis.Any(pa => pa.ApiId == api.Id)));
                if (hasPermissionSetAccess)
                {
                    return true;
                }

                return false;
            });
        }

        public async Task AssignPermissionToUserAsync(string userId, int permissionId, string assignedBy)
        {
            var existing = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);
            if (existing != null) return;

            var userPermission = new UserPermission
            {
                UserId = userId,
                PermissionId = permissionId,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = assignedBy
            };
            _context.UserPermissions.Add(userPermission);
            await _context.SaveChangesAsync();
            
            _cache.Remove($"user_permissions_{userId}");
            InvalidatePermissionCache();
        }

        public async Task UnassignPermissionFromUserAsync(string userId, int permissionId)
        {
            var userPermission = await _context.UserPermissions
                .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);
            if (userPermission != null)
            {
                _context.UserPermissions.Remove(userPermission);
                await _context.SaveChangesAsync();
                
                _cache.Remove($"user_permissions_{userId}");
                InvalidatePermissionCache();
            }
        }

        public async Task AssignPermissionSetToUserAsync(string userId, int permissionSetId, string assignedBy)
        {
            var existing = await _context.UserPermissionSets
                .FirstOrDefaultAsync(ups => ups.UserId == userId && ups.PermissionSetId == permissionSetId);
            if (existing != null) return;

            var userPermissionSet = new UserPermissionSet
            {
                UserId = userId,
                PermissionSetId = permissionSetId,
                AssignedAt = DateTime.UtcNow,
                AssignedBy = assignedBy
            };
            _context.UserPermissionSets.Add(userPermissionSet);
            await _context.SaveChangesAsync();
            
            // Invalidate user specific cache immediately
            _cache.Remove($"user_permissions_{userId}");
            InvalidatePermissionCache();
        }

        public async Task UnassignPermissionSetFromUserAsync(string userId, int permissionSetId)
        {
            var userPermissionSet = await _context.UserPermissionSets
                .FirstOrDefaultAsync(ups => ups.UserId == userId && ups.PermissionSetId == permissionSetId);
            if (userPermissionSet != null)
            {
                _context.UserPermissionSets.Remove(userPermissionSet);
                await _context.SaveChangesAsync();
                
                // Invalidate user specific cache immediately
                _cache.Remove($"user_permissions_{userId}");
                InvalidatePermissionCache();
            }
        }

        public void InvalidatePermissionCache()
        {
            _cache.Remove("all_apis");
            _cache.Remove("all_permissions");
            _cache.Remove("all_permission_sets");
            
            // Invalidate user permission caches (keys start with user_permissions_ and has_access_)
            // Since MemoryCache doesn't support wildcards directly, we can use a version token or clear keys if tracked,
            // or we can store user permission caches with short expirations / check DB directly.
            // Alternatively, let's also remove cache for specific users if needed, or rely on short TTL.
        }

        public async Task<IEnumerable<Profile>> GetAllProfilesAsync()
        {
            return await _context.Profiles.ToListAsync();
        }

        public async Task<Profile> CreateProfileAsync(string name, string description, bool isSystemAdmin)
        {
            var profile = new Profile { Name = name, Description = description, IsSystemAdmin = isSystemAdmin };
            _context.Profiles.Add(profile);
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task<Profile> UpdateProfileAsync(int id, string name, string description, bool isSystemAdmin)
        {
            var profile = await _context.Profiles.FirstOrDefaultAsync(x => x.ProfileId == id);
            if (profile == null) return null;

            profile.Name = name;
            profile.Description = description;
            profile.IsSystemAdmin = isSystemAdmin;
            await _context.SaveChangesAsync();
            return profile;
        }

        public async Task DeleteProfileAsync(int id)
        {
            var profile = await _context.Profiles.FirstOrDefaultAsync(x => x.ProfileId == id);
            if (profile != null)
            {
                _context.Profiles.Remove(profile);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AssignProfileToUserAsync(string userId, int? profileId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);

            if (user != null)
            {
                user.ProfileId = profileId;

            }
            if (emp != null)
            {
                emp.ProfileId = profileId;
            }
            await _context.SaveChangesAsync();
        }

        public async Task<Profile?> GetUserProfileAsync(string userId)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.Id == userId);

            var Uid = emp?.UserId;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == Uid);
            if (user?.ProfileId != null)
            {
                return await _context.Profiles.FirstOrDefaultAsync(p => p.ProfileId == user.ProfileId);
            }
            return null;
        }
    }
}