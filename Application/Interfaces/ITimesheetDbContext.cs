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
        DbSet<BusinessUnit> BusinessUnits { get; }
        DbSet<Profile> Profiles { get; }
        DbSet<Allocation> Allocations { get; }
        DbSet<Timesheet> Timesheets { get; }
        DbSet<BenchHour> BenchHours { get; }
        DbSet<LeaveRecord> LeaveRecords { get; }
        DbSet<Holiday> Holidays { get; }
        DbSet<Approval> Approvals { get; }
        DbSet<Api> Apis { get; }
        DbSet<Permission> Permissions { get; }
        DbSet<PermissionApi> PermissionApis { get; }
        DbSet<PermissionSet> PermissionSets { get; }
        DbSet<PermissionSetApi> PermissionSetApis { get; }
        DbSet<PermissionSetPermission> PermissionSetPermissions { get; }
        DbSet<UserPermissionSet> UserPermissionSets { get; }
        DbSet<UserPermission> UserPermissions { get; }
        DbSet<ApplicationUser> Users { get; }
        Microsoft.EntityFrameworkCore.Infrastructure.DatabaseFacade Database { get; }

        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
