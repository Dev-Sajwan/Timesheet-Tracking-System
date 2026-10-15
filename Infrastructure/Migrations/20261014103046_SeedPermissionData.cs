using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedPermissionData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clear existing data first
            migrationBuilder.Sql("DELETE FROM [PermissionSetApis]");
            migrationBuilder.Sql("DELETE FROM [UserPermissionSets]");
            migrationBuilder.Sql("DELETE FROM [Apis]");
            migrationBuilder.Sql("DELETE FROM [PermissionSets]");

            // Seed Admin permission set
            migrationBuilder.InsertData(
                table: "PermissionSets",
                columns: new[] { "Id", "Name", "Description", "IsSystem", "IsAssignable", "CreatedAt", "UpdatedAt" },
                values: new object[] { 1, "Admin", "System administrator with full access to all APIs", true, false, DateTime.UtcNow, DateTime.UtcNow });

            // Seed Apis table with all API endpoints
            migrationBuilder.InsertData(
                table: "Apis",
                columns: new[] { "Id", "Name", "Description", "Route", "HttpMethod", "Controller", "IsSensitive" },
                values: new object[,]
                {
                    { 1, "Employee.View", "Can view employees", "/api/employees", "GET", "EmployeesController", false },
                    { 2, "Employee.Create", "Can create employees", "/api/employees", "POST", "EmployeesController", false },
                    { 3, "Employee.Edit", "Can edit employees", "/api/employees/{id}", "PUT", "EmployeesController", false },
                    { 4, "Employee.Delete", "Can delete employees", "/api/employees/{id}", "DELETE", "EmployeesController", false },
                    { 5, "Employee.BulkUpload", "Can bulk upload employees", "/api/employees/bulk", "POST", "EmployeesController", false },
                    { 6, "Project.View", "Can view projects", "/api/projects", "GET", "ProjectsController", false },
                    { 7, "Project.Create", "Can create projects", "/api/projects", "POST", "ProjectsController", false },
                    { 8, "Project.Edit", "Can edit projects", "/api/projects/{id}", "PUT", "ProjectsController", false },
                    { 9, "Project.Delete", "Can delete projects", "/api/projects/{id}", "DELETE", "ProjectsController", false },
                    { 10, "BusinessUnit.View", "Can view business units", "/api/businessunits", "GET", "BusinessUnitsController", false },
                    { 11, "BusinessUnit.Create", "Can create business units", "/api/businessunits", "POST", "BusinessUnitsController", false },
                    { 12, "BusinessUnit.Edit", "Can edit business units", "/api/businessunits/{id}", "PUT", "BusinessUnitsController", false },
                    { 13, "BusinessUnit.Delete", "Can delete business units", "/api/businessunits/{id}", "DELETE", "BusinessUnitsController", false },
                    { 14, "Allocation.View", "Can view allocations", "/api/allocations", "GET", "AllocationsController", false },
                    { 15, "Allocation.Create", "Can create allocations", "/api/allocations", "POST", "AllocationsController", false },
                    { 16, "Allocation.Edit", "Can edit allocations", "/api/allocations/{id}", "PUT", "AllocationsController", false },
                    { 17, "Allocation.Delete", "Can delete allocations", "/api/allocations/{id}", "DELETE", "AllocationsController", false },
                    { 18, "Timesheet.View", "Can view timesheets", "/api/timesheets", "GET", "TimesheetsController", false },
                    { 19, "Timesheet.Create", "Can create timesheets", "/api/timesheets", "POST", "TimesheetsController", false },
                    { 20, "Timesheet.Edit", "Can edit timesheets", "/api/timesheets/{id}", "PUT", "TimesheetsController", false },
                    { 21, "Timesheet.Delete", "Can delete timesheets", "/api/timesheets/{id}", "DELETE", "TimesheetsController", false },
                    { 22, "Timesheet.Approve", "Can approve/reject timesheets", "/api/timesheets/{id}/approve", "POST", "TimesheetsController", false },
                    { 23, "Timesheet.WeeklySubmit", "Can submit weekly timesheets", "/api/timesheets/weekly", "POST", "TimesheetsController", false },
                    { 24, "Holiday.View", "Can view holidays", "/api/holidays", "GET", "HolidaysController", false },
                    { 25, "Holiday.Create", "Can create holidays", "/api/holidays", "POST", "HolidaysController", false },
                    { 26, "Holiday.Edit", "Can edit holidays", "/api/holidays/{id}", "PUT", "HolidaysController", false },
                    { 27, "Holiday.Delete", "Can delete holidays", "/api/holidays/{id}", "DELETE", "HolidaysController", false },
                    { 28, "Leave.View", "Can view leave records", "/api/leaverecords", "GET", "LeaveRecordsController", false },
                    { 29, "Leave.Create", "Can create leave records", "/api/leaverecords", "POST", "LeaveRecordsController", false },
                    { 30, "Leave.Edit", "Can edit leave records", "/api/leaverecords/{id}", "PUT", "LeaveRecordsController", false },
                    { 31, "Leave.Delete", "Can delete leave records", "/api/leaverecords/{id}", "DELETE", "LeaveRecordsController", false },
                    { 32, "Leave.Approve", "Can approve/reject leave requests", "/api/leaverecords/{id}/approve", "POST", "LeaveRecordsController", false },
                    { 33, "Approval.View", "Can view approvals", "/api/approvals", "GET", "ApprovalsController", false },
                    { 34, "Approval.Create", "Can create approvals", "/api/approvals", "POST", "ApprovalsController", false },
                    { 35, "Approval.Approve", "Can approve/reject", "/api/approvals/{id}/approve", "POST", "ApprovalsController", false },
                    { 36, "Client.View", "Can view clients", "/api/clients", "GET", "ClientsController", false },
                    { 37, "Client.Create", "Can create clients", "/api/clients", "POST", "ClientsController", false },
                    { 38, "Client.Edit", "Can edit clients", "/api/clients/{id}", "PUT", "ClientsController", false },
                    { 39, "Client.Delete", "Can delete clients", "/api/clients/{id}", "DELETE", "ClientsController", false },
                    // Sensitive APIs - only accessible by Admin users or System Admin profile
                    { 40, "Role.View", "Can view roles", "/api/permissions/roles", "GET", "PermissionsController", true },
                    { 41, "Role.Create", "Can create roles", "/api/permissions/roles", "POST", "PermissionsController", true },
                    { 42, "Role.Edit", "Can edit roles", "/api/permissions/roles/{id}", "PUT", "PermissionsController", true },
                    { 43, "Role.Delete", "Can delete roles", "/api/permissions/roles/{id}", "DELETE", "PermissionsController", true },
                    { 44, "Permission.View", "Can view permissions", "/api/permissions/apis", "GET", "PermissionsController", true },
                    { 45, "Permission.Create", "Can create permissions", "/api/permissions/apis", "POST", "PermissionsController", true },
                    { 46, "Permission.Edit", "Can edit permissions", "/api/permissions/apis/{id}", "PUT", "PermissionsController", true },
                    { 47, "Permission.Delete", "Can delete permissions", "/api/permissions/apis/{id}", "DELETE", "PermissionsController", true },
                    { 48, "PermissionSet.View", "Can view permission sets", "/api/permissions/permission-sets", "GET", "PermissionsController", true },
                    { 49, "PermissionSet.Create", "Can create permission sets", "/api/permissions/permission-sets", "POST", "PermissionsController", true },
                    { 50, "PermissionSet.Edit", "Can edit permission sets", "/api/permissions/permission-sets/{id}", "PUT", "PermissionsController", true },
                    { 51, "PermissionSet.Delete", "Can delete permission sets", "/api/permissions/permission-sets/{id}", "DELETE", "PermissionsController", true },
                    { 52, "PermissionSet.AssignToRole", "Can assign permission sets to roles", "/api/permissions/roles/{roleId}/permission-set/{permissionSetId}", "POST", "PermissionsController", true },
                    { 53, "Profile.View", "Can view profiles", "/api/profile", "GET", "ProfileController", true },
                    { 54, "Profile.Create", "Can create profiles", "/api/profile", "POST", "ProfileController", true },
                    { 55, "Profile.Edit", "Can edit profiles", "/api/profile/{id}", "PUT", "ProfileController", true },
                    { 56, "Profile.Delete", "Can delete profiles", "/api/profile/{id}", "DELETE", "ProfileController", true },
                    { 57, "Profile.AssignToUser", "Can assign profiles to users", "/api/profile/assign", "POST", "ProfileController", true },
                    { 58, "Auth.AssignRole", "Can assign roles to users", "/api/auth/assign-role", "POST", "AuthController", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Apis",
                keyColumn: "Id",
                keyValues: new object[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58 });

            migrationBuilder.DeleteData(
                table: "PermissionSets",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}