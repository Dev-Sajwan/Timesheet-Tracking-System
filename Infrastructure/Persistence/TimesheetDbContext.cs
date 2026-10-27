using Application.Interfaces;
using Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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
        public DbSet<LeaveType> LeaveTypes { get; set; }
        public DbSet<LeaveBalance> LeaveBalances { get; set; }
        public DbSet<Holiday> Holidays { get; set; }
        public DbSet<Approval> Approvals { get; set; }
        public DbSet<Api> Apis { get; set; }
        public DbSet<Permission> Permissions { get; set; }
        public DbSet<PermissionApi> PermissionApis { get; set; }
        public DbSet<PermissionSet> PermissionSets { get; set; }
        public DbSet<PermissionSetApi> PermissionSetApis { get; set; }
        public DbSet<PermissionSetPermission> PermissionSetPermissions { get; set; }
        public DbSet<UserPermissionSet> UserPermissionSets { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; }

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

            // Configure Api entity
            builder.Entity<Api>()
                .HasIndex(a => new { a.Route, a.HttpMethod })
                .IsUnique();

            // Configure many-to-many between Api and PermissionSet via PermissionSetApi
            builder.Entity<PermissionSetApi>()
                .HasKey(psa => new { psa.PermissionSetId, psa.ApiId });

            builder.Entity<PermissionSetApi>()
                .HasOne(psa => psa.PermissionSet)
                .WithMany(ps => ps.PermissionSetApis)
                .HasForeignKey(psa => psa.PermissionSetId);

            builder.Entity<PermissionSetApi>()
                .HasOne(psa => psa.Api)
                .WithMany(a => a.ApiPermissionSets)
                .HasForeignKey(psa => psa.ApiId);

            // Configure UserPermissionSet
            builder.Entity<UserPermissionSet>()
                .HasKey(ups => new { ups.UserId, ups.PermissionSetId });

            builder.Entity<UserPermissionSet>()
                .HasOne(ups => ups.User)
                .WithMany(u => u.UserPermissionSets)
                .HasForeignKey(ups => ups.UserId);

            builder.Entity<UserPermissionSet>()
                .HasOne(ups => ups.PermissionSet)
                .WithMany(ps => ps.UserPermissionSets)
                .HasForeignKey(ups => ups.PermissionSetId);

            // Configure Permission entity
            builder.Entity<Permission>()
                .HasKey(p => p.Id);

            // Configure many-to-many between Permission and Api via PermissionApi
            builder.Entity<PermissionApi>()
                .HasKey(pa => new { pa.PermissionId, pa.ApiId });

            builder.Entity<PermissionApi>()
                .HasOne(pa => pa.Permission)
                .WithMany(p => p.PermissionApis)
                .HasForeignKey(pa => pa.PermissionId);

            builder.Entity<PermissionApi>()
                .HasOne(pa => pa.Api)
                .WithMany(a => a.PermissionApis)
                .HasForeignKey(pa => pa.ApiId);

            // Configure PermissionSetPermission (many-to-many)
            builder.Entity<PermissionSetPermission>()
                .HasKey(psp => new { psp.PermissionSetId, psp.PermissionId });

            builder.Entity<PermissionSetPermission>()
                .HasOne(psp => psp.PermissionSet)
                .WithMany(ps => ps.PermissionSetPermissions)
                .HasForeignKey(psp => psp.PermissionSetId);

            builder.Entity<PermissionSetPermission>()
                .HasOne(psp => psp.Permission)
                .WithMany(p => p.PermissionSetPermissions)
                .HasForeignKey(psp => psp.PermissionId);

            // Configure UserPermission
            builder.Entity<UserPermission>()
                .HasKey(up => new { up.UserId, up.PermissionId });

            builder.Entity<UserPermission>()
                .HasOne(up => up.User)
                .WithMany(u => u.UserPermissions)
                .HasForeignKey(up => up.UserId);

            builder.Entity<UserPermission>()
                .HasOne(up => up.Permission)
                .WithMany(p => p.UserPermissions)
                .HasForeignKey(up => up.PermissionId);
        }
    }
}
