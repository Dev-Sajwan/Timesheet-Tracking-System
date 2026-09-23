using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;

        public ProjectService(IProjectRepository repository) => _repository = repository;

        public void Add(Project project) => _repository.Add(project);
        public IEnumerable<Project> GetAll() => _repository.GetAll();
        public Project? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
