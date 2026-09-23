using Application.Interfaces;
using Domain.Entities;

namespace Infrastructure.Persistence
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly TimesheetDbContext _context;

        public EmployeeRepository(TimesheetDbContext context) => _context = context;

        public void Add(Employee employee)
        {
            _context.Employees.Add(employee);
            _context.SaveChanges();
        }

        public IEnumerable<Employee> GetAll() => _context.Employees.ToList();
        public Employee? GetById(int id) => _context.Employees.Find(id);

        public void Delete(int id)
        {
            var emp = _context.Employees.Find(id);
            if (emp != null)
            {
                _context.Employees.Remove(emp);
                _context.SaveChanges();
            }
        }
    }
}
