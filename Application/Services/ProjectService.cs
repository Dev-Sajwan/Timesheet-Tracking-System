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
