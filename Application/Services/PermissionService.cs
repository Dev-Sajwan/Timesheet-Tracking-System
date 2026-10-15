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
        Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync();
        Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> apiIds);
        Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> apiIds);
        Task DeletePermissionSetAsync(int id);
        Task<List<string>> GetUserPermissionsAsync(string userId);
        Task<bool> HasAccess(string userId, string apiRoute, string httpMethod);

        // Profile-related methods (unchanged)
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

        public async Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync()
        {
            return await _cache.GetOrCreateAsync("all_permission_sets", async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;
                return await _context.PermissionSets
                    .Include(ps => ps.PermissionSetApis)
                        .ThenInclude(psa => psa.Api)
                    .ToListAsync();
            });
        }

        public async Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> apiIds)
        {
            var ps = new PermissionSet { Name = name, Description = description };
            var apis = await _context.Apis.Where(a => apiIds.Contains(a.Id)).ToListAsync();
            foreach (var api in apis)
            {
                ps.PermissionSetApis.Add(new PermissionSetApi { Api = api });
            }
            _context.PermissionSets.Add(ps);
            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return ps;
        }

        public async Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> apiIds)
        {
            var ps = await _context.PermissionSets
                .Include(x => x.PermissionSetApis)
                .FirstOrDefaultAsync(x => x.Id == id);
            if (ps == null) return null;

            ps.Name = name;
            ps.Description = description;

            // Remove existing API links
            _context.PermissionSetApis.RemoveRange(ps.PermissionSetApis);

            // Add new API links
            var apis = await _context.Apis.Where(a => apiIds.Contains(a.Id)).ToListAsync();
            foreach (var api in apis)
            {
                ps.PermissionSetApis.Add(new PermissionSetApi { Api = api });
            }

            await _context.SaveChangesAsync();
            InvalidatePermissionCache();
            return ps;
        }

        public async Task DeletePermissionSetAsync(int id)
        {
            var ps = await _context.PermissionSets.Include(ps => ps.PermissionSetApis).FirstOrDefaultAsync(x => x.Id == id);
            if (ps != null)
            {
                _context.PermissionSetApis.RemoveRange(ps.PermissionSetApis);
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

                // Get permission sets assigned directly to the user
                var userPermissionSets = await _context.UserPermissionSets
                    .Include(ups => ups.PermissionSet)
                        .ThenInclude(ps => ps.PermissionSetApis)
                            .ThenInclude(psa => psa.Api)
                    .Where(ups => ups.UserId == userId)
                    .ToListAsync();

                foreach (var ups in userPermissionSets)
                {
                    permissionNames.AddRange(ups.PermissionSet.PermissionSetApis.Select(psa => psa.Api.Name));
                }

                // TODO: Also include permission sets from roles if we decide to keep role-based assignment
                // For now, we only consider user-assigned permission sets.

                return permissionNames.Distinct().ToList();
            });
        }

        public async Task<bool> HasAccess(string userId, string apiRoute, string httpMethod)
        {
            var cacheKey = $"has_access_{userId}_{apiRoute}_{httpMethod}";
            return await _cache.GetOrCreateAsync(cacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = _cacheExpiration;

                // 1. If the user is in the Admin set, return true.
                var isAdmin = await _context.UserPermissionSets
                    .AnyAsync(ups => ups.UserId == userId && ups.PermissionSet.IsSystem);
                if (isAdmin)
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

                // 3. If IsSensitive is true, return true only if the user has the designated profile.
                if (api.IsSensitive)
                {
                    var hasAdminProfile = await _context.Users
                        .Where(u => u.Id == userId)
                        .Select(u => u.Profile)
                        .AnyAsync(p => p.IsSystemAdmin);
                    return hasAdminProfile;
                }

                // 4. Otherwise, return true if any of the user's permission sets contains this API.
                return await _context.UserPermissionSets
                    .AnyAsync(ups => ups.UserId == userId && 
                                     ups.PermissionSet.PermissionSetApis.Any(psa => psa.Api.Id == api.Id));
            });
        }

        public void InvalidatePermissionCache()
        {
            _cache.Remove("all_apis");
            _cache.Remove("all_permission_sets");
            // Note: User-specific caches will expire naturally or could be invalidated by pattern if needed
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
            if (user != null)
            {
                user.ProfileId = profileId;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Profile?> GetUserProfileAsync(string userId)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user?.ProfileId != null)
            {
                return await _context.Profiles.FirstOrDefaultAsync(p => p.ProfileId == user.ProfileId);
            }
            return null;
        }
    }
}