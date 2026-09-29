using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class RolesRepository : IRolesRepository
    {
        private readonly RoleManager<IdentityRole> _roleManager;

        public RolesRepository(RoleManager<IdentityRole> roleManager)
        {
            _roleManager = roleManager;
        }

        public async Task<IEnumerable<IdentityRole>> GetAllAspNetRoles()
        {
            return _roleManager.Roles;
        }

        public async Task<IdentityRole?> GetAspNetRoleByID(string id)
        {
            return await _roleManager.FindByIdAsync(id);
        }

        public async Task<IdentityResult> InsertAspNetRole(IdentityRole role)
        {
            return await _roleManager.CreateAsync(role);
        }

        public async Task<IdentityResult> UpdateAspNetRole(IdentityRole role)
        {
            var existingRole = await _roleManager.FindByIdAsync(role.Id);
            if (existingRole == null) return IdentityResult.Failed(new IdentityError { Description = "Role not found" });

            existingRole.Name = role.Name;
            return await _roleManager.UpdateAsync(existingRole);
        }

        public async Task<int> DeleteAspNetRole(string id)
        {
            var role = await _roleManager.FindByIdAsync(id);
            if (role == null) return 0;

            var result = await _roleManager.DeleteAsync(role);
            return result.Succeeded ? 1 : 0;
        }
    }
}
