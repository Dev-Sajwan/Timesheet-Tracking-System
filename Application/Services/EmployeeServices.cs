using Application.Interfaces;
using Domain.Entities;

namespace Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _repository;

        public EmployeeService(IEmployeeRepository repository) => _repository = repository;

        public void Add(Employee employee) => _repository.Add(employee);
        public IEnumerable<Employee> GetAll() => _repository.GetAll();
        public Employee? GetById(int id) => _repository.GetById(id);
        public void Delete(int id) => _repository.Delete(id);
    }
}
