using Domain.Entities;

namespace Application.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<Employee?> GetByIdAsync(string id);
        Task<Employee?> GetByEmailAsync(string email);
        Task<IEnumerable<Employee>> GetAllAsync();
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(string id);

        // Add for user functionality
        //Task<Employee?> GetByUserName(string userName);
        //Task<Employee?> GetByEmail(string email);
        //Task<Employee> InsertUser(Employee employee);
        //Task<bool> ValidatePassword(Employee employee, string password);
        //Task AssignRole(string employeeId, string roleName);
    }
}
