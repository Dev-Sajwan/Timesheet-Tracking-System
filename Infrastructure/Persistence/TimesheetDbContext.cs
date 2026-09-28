using Application.Interfaces;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence
{
    public class TimesheetDbContext : DbContext, ITimesheetDbContext
    {
        public TimesheetDbContext(DbContextOptions<TimesheetDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Allocation> Allocations { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }
        public DbSet<BenchHour> BenchHours { get; set; }
        public DbSet<LeaveRecord> LeaveRecords { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<Approval> Approvals { get; set; }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return base.SaveChangesAsync(cancellationToken);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Your entity configurations (already defined)
        }
    }
}
