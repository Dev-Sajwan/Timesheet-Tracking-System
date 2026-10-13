using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _projectRepository;

        public ProjectService(IProjectRepository projectRepository)
        {
            _projectRepository = projectRepository;
        }

        public async Task<Project?> GetByIdAsync(int id) =>
            await _projectRepository.GetByIdAsync(id);

        public async Task<IEnumerable<Project>> GetAllAsync() =>
            await _projectRepository.GetAllAsync();

        public async Task<IEnumerable<Project>> GetAllAsync(string currentUserRole)
        {
            // Admin bypass - if empty or null role, return all (admin case)
            if (string.IsNullOrEmpty(currentUserRole))
                return await _projectRepository.GetAllAsync();

            // For projects, we need to filter based on the project's business unit/client's associated employees
            // For simplicity, we'll return all projects for now, but in a real scenario you'd filter by business unit hierarchy
            return await _projectRepository.GetAllAsync();
        }

        public async Task AddAsync(Project project) =>
            await _projectRepository.AddAsync(project);

        public async Task UpdateAsync(Project project) =>
            await _projectRepository.UpdateAsync(project);

        public async Task DeleteAsync(int id) =>
            await _projectRepository.DeleteAsync(id);

        public async Task<bool> ExistsByNameAsync(string projectName) =>
            await _projectRepository.ExistsByNameAsync(projectName);
    }
}
