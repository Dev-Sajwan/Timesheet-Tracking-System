using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly TimesheetDbContext _context;

        public ProjectRepository(TimesheetDbContext context) => _context = context;

        public void Add(Project project)
        {
            _context.Projects.Add(project);
            _context.SaveChanges();
        }

        public IEnumerable<Project> GetAll() => _context.Projects.ToList();
        public Project? GetById(int id) => _context.Projects.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Projects.Find(id);
            if (emp != null)
            {
                _context.Projects.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
