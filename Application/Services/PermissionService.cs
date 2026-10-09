using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Services
{
    public interface IPermissionService
    {
        Task<IEnumerable<Permission>> GetAllPermissionsAsync();
        Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync();
        Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> permissionIds);
        Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> permissionIds);
        Task DeletePermissionSetAsync(int id);
        Task UpdateRolePermissionSetAsync(string roleId, int permissionSetId);
        Task<List<string>> GetUserPermissionsAsync(List<string> roleIds);
        
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

        public PermissionService(ITimesheetDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _context.Permissions.ToListAsync();
        }

        public async Task<IEnumerable<PermissionSet>> GetAllPermissionSetsAsync()
        {
            return await _context.PermissionSets.Include(ps => ps.Permissions).ToListAsync();
        }

        public async Task<PermissionSet> CreatePermissionSetAsync(string name, string description, List<int> permissionIds)
        {
            var ps = new PermissionSet { Name = name, Description = description };
            var perms = await _context.Permissions.Where(p => permissionIds.Contains(p.Id)).ToListAsync();
            ps.Permissions = perms;
            _context.PermissionSets.Add(ps);
            await _context.SaveChangesAsync();
            return ps;
        }

        public async Task<PermissionSet> UpdatePermissionSetAsync(int id, string name, string description, List<int> permissionIds)
        {
            var ps = await _context.PermissionSets.Include(x => x.Permissions).FirstOrDefaultAsync(x => x.Id == id);
            if (ps == null) return null;
            
            ps.Name = name;
            ps.Description = description;
            var perms = await _context.Permissions.Where(p => permissionIds.Contains(p.Id)).ToListAsync();
            ps.Permissions = perms;
            await _context.SaveChangesAsync();
            return ps;
        }

        public async Task DeletePermissionSetAsync(int id)
        {
            var ps = await _context.PermissionSets.FirstOrDefaultAsync(x => x.Id == id);
            if (ps != null)
            {
                _context.PermissionSets.Remove(ps);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateRolePermissionSetAsync(string roleId, int permissionSetId)
        {
            var existing = await _context.RolePermissionSets.FirstOrDefaultAsync(r => r.RoleId == roleId);
            if (existing != null)
            {
                existing.PermissionSetId = permissionSetId;
            }
            else
            {
                _context.RolePermissionSets.Add(new RolePermissionSet { RoleId = roleId, PermissionSetId = permissionSetId });
            }
            await _context.SaveChangesAsync();
        }

        public async Task<List<string>> GetUserPermissionsAsync(List<string> roleIds)
        {
            var permissionNames = new List<string>();
            foreach (var role in roleIds)
            {
                var rps = await _context.RolePermissionSets
                    .Include(x => x.PermissionSet)
                        .ThenInclude(ps => ps.Permissions)
                    .FirstOrDefaultAsync(x => x.RoleId == role);
                
                if (rps != null)
                {
                    permissionNames.AddRange(rps.PermissionSet.Permissions.Select(p => p.Name));
                }
            }
            return permissionNames.Distinct().ToList();
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
