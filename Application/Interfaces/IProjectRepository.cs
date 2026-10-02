using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Interfaces
{
    public interface IProjectRepository
    {
        Task<Project?> GetByIdAsync(int id);
        Task<IEnumerable<Project>> GetAllAsync();
        Task AddAsync(Project project);
        Task UpdateAsync(Project project);
        Task DeleteAsync(int id);
        Task<bool> ExistsByNameAsync(string projectName);
    }
}
