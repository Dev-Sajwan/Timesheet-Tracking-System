using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ITimesheetDbContext _context;

    public EmployeeRepository(ITimesheetDbContext context)
    {
        _context = context;
    }

    public async Task<Employee?> GetByIdAsync(string id) =>
        await _context.Employees
            .Include(e => e.Allocations)
            .Include(e => e.Timesheets)
            .FirstOrDefaultAsync(e => e.Id == id);

    public async Task<Employee?> GetByUserIdAsync(string userId) =>
        await _context.Employees
            .FirstOrDefaultAsync(e => e.UserId == userId);

    public async Task<Employee?> GetByEmailAsync(string email) =>
        await _context.Employees
            //.Include(e => e.Allocations)
            //.Include(e => e.Timesheets)
            .FirstOrDefaultAsync(e => e.Email != null && e.Email == email);

    public async Task<IEnumerable<Employee>> GetAllAsync() =>
        await _context.Employees
            .Include(e => e.Allocations)
            .Include(e => e.Timesheets)
            .ToListAsync();

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
}
