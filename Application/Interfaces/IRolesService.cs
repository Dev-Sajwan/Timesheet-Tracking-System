using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Application.DTOs;

namespace Application.Interfaces
{
    public interface IRolesService
    {
        Task<IEnumerable<IdentityRole>> GetAllAspNetRoles();
        Task<IdentityRole?> GetAspNetRoleByID(string id);
        Task<IdentityResult> InsertAspNetRole(RolesRequestDto request);
        Task<IdentityResult> UpdateAspNetRole(RolesRequestDto request, string id);
        Task<int> DeleteAspNetRole(string id);
    }
}
