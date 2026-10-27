using Application.Interfaces;
using Domain.Entities;

namespace Application.Services;

public class LeaveRecordService : ILeaveRecordService
{
    private readonly ILeaveRecordRepository _leaveRepository;
    private readonly ILeaveBalanceRepository _balanceRepository;
    private readonly ITimesheetDbContext _context;

    public LeaveRecordService(
        ILeaveRecordRepository leaveRepository,
        ILeaveBalanceRepository balanceRepository,
        ITimesheetDbContext context)
    {
        _leaveRepository = leaveRepository;
        _balanceRepository = balanceRepository;
        _context = context;
    }

    public async Task<IEnumerable<LeaveRecord>> GetAllAsync() => await _leaveRepository.GetAllAsync();

    public async Task<IEnumerable<LeaveRecord>> GetByEmployeeIdAsync(string employeeId) =>
        await _leaveRepository.GetByEmployeeIdAsync(employeeId);

    public async Task<LeaveRecord?> GetByIdAsync(int id) => await _leaveRepository.GetByIdAsync(id);

    public async Task<LeaveRecord> ApplyLeaveAsync(LeaveRecord leaveRecord)
    {
        // Calculate working days excluding weekends & company holidays
        var holidays = _context.Holidays.Select(h => h.Date.Date).ToHashSet();
        decimal totalDays = 0;
        for (var date = leaveRecord.StartDate.Date; date <= leaveRecord.EndDate.Date; date = date.AddDays(1))
        {
            if (date.DayOfWeek != DayOfWeek.Saturday && date.DayOfWeek != DayOfWeek.Sunday && !holidays.Contains(date))
            {
                totalDays += 1;
            }
        }

        if (leaveRecord.HalfDayType != "None" && totalDays >= 1)
        {
            totalDays -= 0.5m;
            
        }

        if (totalDays <= 0)
        {
            throw new InvalidOperationException("Selected leave duration contains no valid working days.");
        }

        leaveRecord.TotalDays = totalDays;

        // Check balance
        int year = leaveRecord.StartDate.Year;
        var balance = await _balanceRepository.GetAsync(leaveRecord.EmployeeId!, leaveRecord.LeaveTypeId, year);
        if (balance == null)
        {
            // Auto initialize default balance if not present
            var leaveType = await _context.LeaveTypes.FindAsync(leaveRecord.LeaveTypeId);
            decimal quota = leaveType?.DefaultQuota ?? 12;
            balance = new LeaveBalance
            {
                EmployeeId = leaveRecord.EmployeeId!,
                LeaveTypeId = leaveRecord.LeaveTypeId,
                Year = year,
                OpeningBalance = quota,
                CreditedBalance = 0,
                LeavesTaken = 0
            };
            await _balanceRepository.AddAsync(balance);
        }

        if (balance.ClosingBalance < totalDays)
        {
            throw new InvalidOperationException($"Insufficient leave balance. Available: {balance.ClosingBalance}, Requested: {totalDays}");
        }

        leaveRecord.Status = "Pending";
        leaveRecord.ApprovalStage = "Manager";
        leaveRecord.CreatedAt = DateTime.UtcNow;

        await _leaveRepository.AddAsync(leaveRecord);

        // Deduct/increment leaves taken
        balance.LeavesTaken += totalDays;
        await _balanceRepository.UpdateAsync(balance);

        return leaveRecord;
    }

    public async Task CancelLeaveAsync(int id, string employeeId)
    {
        var record = await _leaveRepository.GetByIdAsync(id);
        if (record == null) throw new KeyNotFoundException("Leave record not found.");
        if (record.EmployeeId != employeeId) throw new UnauthorizedAccessException("Cannot cancel another employee's leave.");
        if (record.Status != "Pending") throw new InvalidOperationException("Only pending leave requests can be cancelled.");

        record.Status = "Cancelled";
        await _leaveRepository.UpdateAsync(record);

        // Restore balance
        int year = record.StartDate.Year;
        var balance = await _balanceRepository.GetAsync(record.EmployeeId, record.LeaveTypeId, year);
        if (balance != null)
        {
            balance.LeavesTaken = Math.Max(0, balance.LeavesTaken - record.TotalDays);
            await _balanceRepository.UpdateAsync(balance);
        }
    }

    public async Task ProcessApprovalAsync(int id, string action, string approvalStage, string? rejectionReason)
    {
        var record = await _leaveRepository.GetByIdAsync(id);
        if (record == null) throw new KeyNotFoundException("Leave record not found.");

        if (action.Equals("Approve", StringComparison.OrdinalIgnoreCase))
        {
            if (approvalStage.Equals("Manager", StringComparison.OrdinalIgnoreCase))
            {
                record.Status = "ManagerApproved";
                record.ApprovalStage = "HR";
            }
            else if (approvalStage.Equals("HR", StringComparison.OrdinalIgnoreCase))
            {
                record.Status = "Approved";
                record.ApprovalStage = "Completed";
            }
            else
            {
                record.Status = "Approved";
                record.ApprovalStage = "Completed";
            }
        }
        else
        {
            record.Status = "Rejected";
            record.RejectionReason = rejectionReason;

            // Restore balance on rejection
            int year = record.StartDate.Year;
            var balance = await _balanceRepository.GetAsync(record.EmployeeId!, record.LeaveTypeId, year);
            if (balance != null)
            {
                balance.LeavesTaken = Math.Max(0, balance.LeavesTaken - record.TotalDays);
                await _balanceRepository.UpdateAsync(balance);
            }
        }

        await _leaveRepository.UpdateAsync(record);
    }

    public async Task<IEnumerable<LeaveBalance>> GetEmployeeBalancesAsync(string employeeId, int year)
    {
        var balances = await _balanceRepository.GetByEmployeeIdAsync(employeeId, year);
        if (!balances.Any())
        {
            // Seed default balances for active leave types
            var leaveTypes = await _balanceRepository.GetAllLeaveTypesAsync();
            foreach (var lt in leaveTypes)
            {
                var newBal = new LeaveBalance
                {
                    EmployeeId = employeeId,
                    LeaveTypeId = lt.LeaveTypeId,
                    Year = year,
                    OpeningBalance = lt.DefaultQuota,
                    CreditedBalance = 0,
                    LeavesTaken = 0
                };
                await _balanceRepository.AddAsync(newBal);
            }
            balances = await _balanceRepository.GetByEmployeeIdAsync(employeeId, year);
        }
        return balances;
    }

    public async Task AdjustBalanceAsync(string employeeId, int leaveTypeId, int year, decimal adjustmentAmount, string adjustmentType)
    {
        var balance = await _balanceRepository.GetAsync(employeeId, leaveTypeId, year);
        if (balance == null)
        {
            balance = new LeaveBalance
            {
                EmployeeId = employeeId,
                LeaveTypeId = leaveTypeId,
                Year = year,
                OpeningBalance = 0,
                CreditedBalance = 0,
                LeavesTaken = 0
            };
            await _balanceRepository.AddAsync(balance);
        }

        if (adjustmentType.Equals("Credit", StringComparison.OrdinalIgnoreCase) || adjustmentType.Equals("CarryForward", StringComparison.OrdinalIgnoreCase))
        {
            balance.CreditedBalance += adjustmentAmount;
        }
        else
        {
            balance.OpeningBalance += adjustmentAmount;
        }

        await _balanceRepository.UpdateAsync(balance);
    }

    public async Task<IEnumerable<LeaveType>> GetLeaveTypesAsync() => await _balanceRepository.GetAllLeaveTypesAsync();

    public async Task UpdateLeaveTypeQuotaAsync(int leaveTypeId, decimal defaultQuota)
    {
        var leaveType = await _context.LeaveTypes.FindAsync(leaveTypeId);
        if (leaveType != null)
        {
            leaveType.DefaultQuota = defaultQuota;
            _context.LeaveTypes.Update(leaveType);
            await _context.SaveChangesAsync();
        }
    }

    public async Task DeleteAsync(int id) => await _leaveRepository.DeleteAsync(id);
}
