using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Interfaces
{
    public interface IRolesRepository
    {
        Task<IEnumerable<IdentityRole>> GetAllAspNetRoles();
        Task<IdentityRole?> GetAspNetRoleByID(string id);
        Task<IdentityResult> InsertAspNetRole(IdentityRole role);
        Task<IdentityResult> UpdateAspNetRole(IdentityRole role);
        Task<int> DeleteAspNetRole(string id);
    }
}
