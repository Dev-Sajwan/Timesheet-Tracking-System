using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Services
{
    public class AllocationService : IAllocationService
    {
        private readonly IAllocationRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmployeeRepository _employeeRepository;

        public AllocationService(IAllocationRepository repository, UserManager<ApplicationUser> userManager, Interfaces.IEmployeeRepository employeeRepository)
        {
            _repository = repository;
            _userManager = userManager;
            _employeeRepository = employeeRepository;
        }

        public async Task AddAsync(Allocation allocation) => await _repository.AddAsync(allocation);
        
        public async Task<IEnumerable<Allocation>> GetAllAsync() => await _repository.GetAllAsync();
        
        public async Task<IEnumerable<Allocation>> GetAllAsync(string currentUserRole)
        {
            // Admin or L1 bypass - return all allocations
            if (string.IsNullOrEmpty(currentUserRole) || currentUserRole == "L1" || currentUserRole == "L2")
                return await _repository.GetAllAsync();

            var allAllocations = await _repository.GetAllAsync();
            var filteredAllocations = new List<Allocation>();
            
            foreach (var alloc in allAllocations)
            {
                var employee = await _employeeRepository.GetByIdAsync(alloc.EmployeeId ?? "");
                if (employee != null && !string.IsNullOrEmpty(employee.UserId))
                {
                    var user = await _userManager.FindByIdAsync(employee.UserId);
                    if (user != null)
                    {
                        var roles = await _userManager.GetRolesAsync(user);
                        var userRole = roles.FirstOrDefault(r => r.StartsWith("L"));
                        var allowedRoles = GetAllowedRoles(currentUserRole);
                        if (userRole != null && allowedRoles.Contains(userRole))
                        {
                            filteredAllocations.Add(alloc);
                        }
                    }
                }
            }
            
            return filteredAllocations;
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

        public async Task<Allocation?> GetByIdAsync(int id) => await _repository.GetByIdAsync(id);
        public async Task<List<Allocation>> GetByEmployeeAndProjectAsync(string employeeId) =>
            await _repository.GetByEmployeeAndProjectAsync(employeeId);
        public async Task DeleteAsync(int id) => await _repository.DeleteAsync(id);
        public async Task UpdateAsync(Allocation allocation) => await _repository.UpdateAsync(allocation);
    }
}
