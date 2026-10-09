using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        private readonly IPasswordHasher<Employee> _passwordHasher;

        public EmployeeService(IEmployeeRepository employeeRepository, IPasswordHasher<Employee> passwordHasher, UserManager<ApplicationUser> userManager)
        {
            _employeeRepository = employeeRepository;
            _passwordHasher = passwordHasher;
            _userManager = userManager;
        }
       
        public async Task<Employee?> GetByIdAsync(string id) =>
            await _employeeRepository.GetByIdAsync(id);

        public async Task<Employee?> GetByEmailAsync(string email) =>
            await _employeeRepository.GetByEmailAsync(email);

        public async Task<IEnumerable<Employee>> GetAllAsync() =>
            await _employeeRepository.GetAllAsync();

        public async Task<IEnumerable<Employee>> GetAllAsync(string currentUserRole)
        {
            var allEmployees = await _employeeRepository.GetAllAsync();
            
            // Role hierarchy: L1 > L2 > L3 > L4
            // L1 can see all, L2 can see L2-L4, L3 can see L3-L4, L4 can see only L4
            var allowedRoles = GetAllowedRoles(currentUserRole);
            
            var filteredEmployees = new List<Employee>();
            foreach (var emp in allEmployees)
            {
                var user = await _userManager.FindByIdAsync(emp.UserId ?? "");
                if (user != null)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var userRole = roles.FirstOrDefault(r => r.StartsWith("L"));
                    if (userRole != null && allowedRoles.Contains(userRole))
                    {
                        filteredEmployees.Add(emp);
                    }
                }
                else if (string.IsNullOrEmpty(currentUserRole))
                {
                    // If no current user role specified, include all
                    filteredEmployees.Add(emp);
                }
            }
            
            return filteredEmployees;
        }

        private List<string> GetAllowedRoles(string currentUserRole)
        {
            var roleHierarchy = new Dictionary<string, List<string>>
            {
                { "L1", new List<string> { "L1", "L2", "L3", "L4" } },
                { "L2", new List<string> { "L2", "L3", "L4" } },
                { "L3", new List<string> { "L3", "L4" } },
                { "L4", new List<string> { "L4" } }
            };

            return roleHierarchy.TryGetValue(currentUserRole, out var roles) ? roles : new List<string>();
        }
       
        public async Task AddAsync(Employee employee) =>
            await _employeeRepository.AddAsync(employee);

        public async Task UpdateAsync(Employee employee) =>
            await _employeeRepository.UpdateAsync(employee);

        public async Task DeleteAsync(string id) =>
            await _employeeRepository.DeleteAsync(id);
    }
}