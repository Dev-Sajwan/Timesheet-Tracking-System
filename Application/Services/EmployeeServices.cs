using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;


        private readonly IPasswordHasher<Employee> _passwordHasher;

        public EmployeeService(IEmployeeRepository employeeRepository, IPasswordHasher<Employee> passwordHasher)
        {
            _employeeRepository = employeeRepository;
            _passwordHasher = passwordHasher;
        }
       


        public async Task<Employee?> GetByIdAsync(string id) =>
            await _employeeRepository.GetByIdAsync(id);

        public async Task<Employee?> GetByEmailAsync(string email) =>
            await _employeeRepository.GetByEmailAsync(email);

        public async Task<IEnumerable<Employee>> GetAllAsync() =>
            await _employeeRepository.GetAllAsync();

        public async Task AddAsync(Employee employee) =>
            await _employeeRepository.AddAsync(employee);

        public async Task UpdateAsync(Employee employee) =>
            await _employeeRepository.UpdateAsync(employee);

        public async Task DeleteAsync(string id) =>
            await _employeeRepository.DeleteAsync(id);

        //public async Task<Employee> RegisterUser(CreateUserRequestDto request)
        //{
        //    var employee = await _employeeRepository.GetByEmail(request.Email);
        //    if (employee == null) throw new Exception("Employee not found");

        //    employee.UserName = request.UserName;
        //    employee.PasswordHash = _passwordHasher.HashPassword(employee, request.Password);
        //    employee.IsActiveUser = true;

        //    return await _employeeRepository.InsertUser(employee);
        //}

        //public async Task<bool> Authenticate(LoginRequest request)
        //{
        //    var employee = await _employeeRepository.GetByUserName(request.UserName);
        //    if (employee == null) return false;

        //    return await _employeeRepository.ValidatePassword(employee, request.Password);
        //}

        //public async Task AssignRole(AssignRoleRequest request)
        //{
        //    await _employeeRepository.AssignRole(request.EmployeeId, request.RoleName);
        //}

    }
}
