using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection.Emit;

namespace Infrastructure.Persistence
{
    public class TimesheetDbContext : IdentityDbContext<ApplicationUser>, ITimesheetDbContext
    {
        public TimesheetDbContext(DbContextOptions<TimesheetDbContext> options) : base(options) { }

        public DbSet<Employee> Employees { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<BusinessUnit> BusinessUnits { get; set; }
        public DbSet<Profile> Profiles { get; set; }
        public DbSet<Allocation> Allocations { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }
        public DbSet<BenchHour> BenchHours { get; set; }
        public DbSet<LeaveRecord> LeaveRecords { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<PermissionSet> PermissionSets { get; set; }
        public DbSet<RolePermissionSet> RolePermissionSets { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Employee>()
                .HasOne(e => e.User)
                .WithOne()
                .HasForeignKey<Employee>(e => e.UserId);

            builder.Entity<Project>()
                .HasIndex(p => new { p.ClientId, p.ProjectName })
                .IsUnique();

            builder.Entity<Project>()
                .HasOne(p => p.BusinessUnit)
                .WithMany(b => b.Projects)
                .HasForeignKey(p => p.BusinessUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Allocation>()
                .HasOne(a => a.BusinessUnit)
                .WithMany()
                .HasForeignKey(a => a.BusinessUnitId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ApplicationUser>()
                .HasOne(u => u.Profile)
                .WithMany(p => p.Users)
                .HasForeignKey(u => u.ProfileId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
