using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class AuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IEmployeeRepository _employeeRepository;

        public AuthService(UserManager<ApplicationUser> userManager,
                           SignInManager<ApplicationUser> signInManager,
                           RoleManager<IdentityRole> roleManager,
                           IEmployeeRepository employeeRepository)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _roleManager = roleManager;
            _employeeRepository = employeeRepository;
        }

        public async Task<Employee> RegisterUser(CreateUserRequestDto request)
        {
            var user = new ApplicationUser { UserName = request.UserName, Email = request.Email };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded) throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            var employee = new Employee
            {
                Id = Guid.NewGuid().ToString(),
                Name = request.FullName,
                Department = request.Department,
                Status = "Active",
                UserId = user.Id
            };

            await _employeeRepository.AddAsync(employee);
            return employee;
        }

        public async Task<bool> Authenticate(LoginRequest request)
        {
            var result = await _signInManager.PasswordSignInAsync(request.UserName, request.Password, false, false);
            return result.Succeeded;
        }

        public async Task AssignRole(AssignRoleRequest request)
        {
            var user = await _userManager.FindByIdAsync(request.EmployeeId);
            if (user == null) throw new Exception("User not found");

            if (!await _roleManager.RoleExistsAsync(request.RoleName))
                throw new Exception("Role does not exist");

            await _userManager.AddToRoleAsync(user, request.RoleName);
        }
    }

}
