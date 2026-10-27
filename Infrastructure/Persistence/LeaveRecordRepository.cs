using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class LeaveRecordRepository : ILeaveRecordRepository
{
    private readonly TimesheetDbContext _context;

    public LeaveRecordRepository(TimesheetDbContext context) => _context = context;

    public async Task AddAsync(LeaveRecord leaveRecord)
    {
        await _context.LeaveRecords.AddAsync(leaveRecord);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<LeaveRecord>> GetAllAsync() => 
        await _context.LeaveRecords
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .ToListAsync();

    public async Task<IEnumerable<LeaveRecord>> GetByEmployeeIdAsync(string employeeId) =>
        await _context.LeaveRecords
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .Where(l => l.EmployeeId == employeeId)
            .ToListAsync();

    public async Task<LeaveRecord?> GetByIdAsync(int id) => 
        await _context.LeaveRecords
            .Include(l => l.Employee)
            .Include(l => l.LeaveType)
            .FirstOrDefaultAsync(l => l.LeaveRecordId == id);

    public async Task UpdateAsync(LeaveRecord leaveRecord)
    {
        _context.LeaveRecords.Update(leaveRecord);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var record = await _context.LeaveRecords.FindAsync(id);
        if (record != null)
        {
            _context.LeaveRecords.Remove(record);
            await _context.SaveChangesAsync();
        }
    }
}

public class LeaveBalanceRepository : ILeaveBalanceRepository
{
    private readonly TimesheetDbContext _context;

    public LeaveBalanceRepository(TimesheetDbContext context) => _context = context;

    public async Task<IEnumerable<LeaveBalance>> GetByEmployeeIdAsync(string employeeId, int year) =>
        await _context.LeaveBalances
            .Include(lb => lb.LeaveType)
            .Where(lb => lb.EmployeeId == employeeId && lb.Year == year)
            .ToListAsync();

    public async Task<LeaveBalance?> GetAsync(string employeeId, int leaveTypeId, int year) =>
        await _context.LeaveBalances
            .FirstOrDefaultAsync(lb => lb.EmployeeId == employeeId && lb.LeaveTypeId == leaveTypeId && lb.Year == year);

    public async Task AddAsync(LeaveBalance leaveBalance)
    {
        await _context.LeaveBalances.AddAsync(leaveBalance);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(LeaveBalance leaveBalance)
    {
        _context.LeaveBalances.Update(leaveBalance);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<LeaveType>> GetAllLeaveTypesAsync() =>
        await _context.LeaveTypes.Where(lt => lt.IsActive).ToListAsync();
}
