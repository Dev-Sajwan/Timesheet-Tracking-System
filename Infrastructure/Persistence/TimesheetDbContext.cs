using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence;

public class TimesheetDbContext : DbContext
{
    public TimesheetDbContext(DbContextOptions<TimesheetDbContext> options) : base(options) { }

    // DbSets
    public DbSet<Employee> Employees { get; set; }
    public DbSet<Client> Clients { get; set; }
    public DbSet<Project> Projects { get; set; }
    public DbSet<Allocation> Allocations { get; set; }
    public DbSet<Timesheet> Timesheets { get; set; }
    public DbSet<BenchHour> BenchHours { get; set; }
    public DbSet<LeaveRecord> LeaveRecords { get; set; }
    public DbSet<Holiday> Holidays { get; set; }
    public DbSet<Approval> Approvals { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Employee
        modelBuilder.Entity<Employee>()
            .HasKey(e => e.EmployeeId);

        modelBuilder.Entity<Employee>()
            .HasMany(e => e.Allocations)
            .WithOne(a => a.Employee)
            .HasForeignKey(a => a.EmployeeId);

        modelBuilder.Entity<Employee>()
            .HasMany(e => e.Timesheets)
            .WithOne(t => t.Employee)
            .HasForeignKey(t => t.EmployeeId);

        modelBuilder.Entity<Employee>()
            .HasMany(e => e.BenchHours)
            .WithOne(b => b.Employee)
            .HasForeignKey(b => b.EmployeeId);

        modelBuilder.Entity<Employee>()
            .HasMany(e => e.LeaveRecords)
            .WithOne(l => l.Employee)
            .HasForeignKey(l => l.EmployeeId);

        // Client
        modelBuilder.Entity<Client>()
            .HasKey(c => c.ClientId);

        modelBuilder.Entity<Client>()
            .HasMany(c => c.Projects)
            .WithOne(p => p.Client)
            .HasForeignKey(p => p.ClientId);

        // Project
        modelBuilder.Entity<Project>()
            .HasKey(p => p.ProjectId);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Allocations)
            .WithOne(a => a.Project)
            .HasForeignKey(a => a.ProjectId);

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Timesheets)
            .WithOne(t => t.Project)
            .HasForeignKey(t => t.ProjectId);

        // Allocation
        modelBuilder.Entity<Allocation>()
            .HasKey(a => a.AllocationId);

        // Timesheet
        modelBuilder.Entity<Timesheet>()
            .HasKey(t => t.TimesheetId);

        modelBuilder.Entity<Timesheet>()
            .HasMany(t => t.Approvals)
            .WithOne(a => a.Timesheet)
            .HasForeignKey(a => a.TimesheetId);

        // BenchHour
        modelBuilder.Entity<BenchHour>()
            .HasKey(b => b.BenchId);

        // LeaveRecord
        modelBuilder.Entity<LeaveRecord>()
            .HasKey(l => l.LeaveId);

        // Holiday
        modelBuilder.Entity<Holiday>()
            .HasKey(h => h.HolidayId);

        // Approval
        modelBuilder.Entity<Approval>()
            .HasKey(a => a.ApprovalId);
    }
}
