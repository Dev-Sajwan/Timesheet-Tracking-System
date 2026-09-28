using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Application.Interfaces
{
    public interface ITimesheetDbContext
    {
        DbSet<Employee> Employees { get; }
        DbSet<Client> Clients { get; }
        DbSet<Project> Projects { get; }
        DbSet<Allocation> Allocations { get; }
        DbSet<Timesheet> Timesheets { get; }
        DbSet<BenchHour> BenchHours { get; }
        DbSet<LeaveRecord> LeaveRecords { get; }
        DbSet<Holiday> Holidays { get; }
        DbSet<Approval> Approvals { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
