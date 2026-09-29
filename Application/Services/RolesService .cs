using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Application.DTOs;

namespace Application.Services
{
    public class RolesService : IRolesService
    {
        private readonly IRolesRepository _rolesRepository;

        public RolesService(IRolesRepository rolesRepository)
        {
            _rolesRepository = rolesRepository;
        }

        public async Task<IEnumerable<IdentityRole>> GetAllAspNetRoles()
        {
            return await _rolesRepository.GetAllAspNetRoles();
        }

        public async Task<IdentityRole?> GetAspNetRoleByID(string id)
        {
            return await _rolesRepository.GetAspNetRoleByID(id);
        }

        public async Task<IdentityResult> InsertAspNetRole(RolesRequestDto request)
        {
            var role = new IdentityRole { Name = request.Name };
            return await _rolesRepository.InsertAspNetRole(role);
        }

        public async Task<IdentityResult> UpdateAspNetRole(RolesRequestDto request, string id)
        {
            var role = new IdentityRole { Id = id, Name = request.Name };
            return await _rolesRepository.UpdateAspNetRole(role);
        }

        public async Task<int> DeleteAspNetRole(string id)
        {
            return await _rolesRepository.DeleteAspNetRole(id);
        }
    }
}
