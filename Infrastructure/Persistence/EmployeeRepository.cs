using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly ITimesheetDbContext _context;
        private readonly IPasswordHasher<Employee> _passwordHasher;

        public EmployeeRepository(ITimesheetDbContext context, IPasswordHasher<Employee> passwordHasher)
        {
            _context = context;
            _passwordHasher = passwordHasher;
        }




        public async Task<Employee?> GetByIdAsync(string id)
        {
            return await _context.Employees
                .Include(e => e.Allocations)
                .Include(e => e.Timesheets)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> GetByEmailAsync(string email)
        {
            return await _context.Employees
                .Include(e => e.Allocations)
                .Include(e => e.Timesheets)
                .FirstOrDefaultAsync(e => e.Email == email);
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees
                .Include(e => e.Allocations)
                .Include(e => e.Timesheets)
                .ToListAsync();
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Employee?> GetByUserName(string userName)
        {
            return await _context.Employees.FirstOrDefaultAsync(e => e.UserName == userName);
        }

        public async Task<bool> ValidatePassword(Employee employee, string password)
        {
            var result = _passwordHasher.VerifyHashedPassword(employee, employee.PasswordHash, password);
            return result == PasswordVerificationResult.Success;
        }

        public async Task<Employee> InsertUser(Employee employee)
        {
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee;
        }

        public async Task AssignRole(string employeeId, string roleName)
        {
            var employee = await _context.Employees.FindAsync(employeeId);
            if (employee != null)
            {
                employee.Role = roleName;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Employee?> GetByEmail(string email)
        {
            return await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);
        }
    }
}
