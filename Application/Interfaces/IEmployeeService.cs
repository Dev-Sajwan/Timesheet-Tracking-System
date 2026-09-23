using Domain.Entities;

namespace Application.Interfaces
{
    public interface IEmployeeService
    {
        void Add(Employee employee);
        IEnumerable<Employee> GetAll();
        Employee? GetById(int id);
        void Delete(int id);
    }
}
