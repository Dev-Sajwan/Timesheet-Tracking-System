using Domain.Entities;

namespace Application.Interfaces
{
    public interface IProjectService
    {
        void Add(Project project);
        IEnumerable<Project> GetAll();
        Project? GetById(int id);
        void Delete(int id);
    }
}
