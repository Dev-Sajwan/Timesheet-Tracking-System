using Application.DTOs;
using Domain.Entities;

namespace Application.Interfaces
{
    public interface IEmployeeService
    {
        Task<Employee?> GetByIdAsync(string id);
        Task<Employee?> GetByEmailAsync(string email);
        Task<IEnumerable<Employee>> GetAllAsync();
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(string id);
        //Task<Employee> RegisterUser(CreateUserRequestDto request);
        //Task<bool> Authenticate(LoginRequest request);
        //Task AssignRole(AssignRoleRequest request);
    }
}
