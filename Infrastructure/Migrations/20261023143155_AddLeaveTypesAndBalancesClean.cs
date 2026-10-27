using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLeaveTypesAndBalancesClean : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LeaveType",
                table: "LeaveRecords",
                newName: "Status");

            migrationBuilder.RenameColumn(
                name: "Hours",
                table: "LeaveRecords",
                newName: "LeaveTypeId");

            migrationBuilder.RenameColumn(
                name: "Date",
                table: "LeaveRecords",
                newName: "StartDate");

            migrationBuilder.AddColumn<string>(
                name: "ApprovalStage",
                table: "LeaveRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "AttachmentPath",
                table: "LeaveRecords",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "LeaveRecords",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "EndDate",
                table: "LeaveRecords",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "HalfDayType",
                table: "LeaveRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Reason",
                table: "LeaveRecords",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "LeaveRecords",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalDays",
                table: "LeaveRecords",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "LeaveTypes",
                columns: table => new
                {
                    LeaveTypeId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DefaultQuota = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveTypes", x => x.LeaveTypeId);
                });

            migrationBuilder.CreateTable(
                name: "PermissionApis",
                columns: table => new
                {
                    PermissionId = table.Column<int>(type: "int", nullable: false),
                    ApiId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionApis", x => new { x.PermissionId, x.ApiId });
                    table.ForeignKey(
                        name: "FK_PermissionApis_Apis_ApiId",
                        column: x => x.ApiId,
                        principalTable: "Apis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermissionApis_Permissions_PermissionId",
                        column: x => x.PermissionId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "LeaveBalances",
                columns: table => new
                {
                    LeaveBalanceId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LeaveTypeId = table.Column<int>(type: "int", nullable: false),
                    Year = table.Column<int>(type: "int", nullable: false),
                    OpeningBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CreditedBalance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LeavesTaken = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveBalances", x => x.LeaveBalanceId);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LeaveBalances_LeaveTypes_LeaveTypeId",
                        column: x => x.LeaveTypeId,
                        principalTable: "LeaveTypes",
                        principalColumn: "LeaveTypeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRecords_LeaveTypeId",
                table: "LeaveRecords",
                column: "LeaveTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_EmployeeId",
                table: "LeaveBalances",
                column: "EmployeeId");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveBalances_LeaveTypeId",
                table: "LeaveBalances",
                column: "LeaveTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionApis_ApiId",
                table: "PermissionApis",
                column: "ApiId");

            migrationBuilder.AddForeignKey(
                name: "FK_LeaveRecords_LeaveTypes_LeaveTypeId",
                table: "LeaveRecords",
                column: "LeaveTypeId",
                principalTable: "LeaveTypes",
                principalColumn: "LeaveTypeId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeaveRecords_LeaveTypes_LeaveTypeId",
                table: "LeaveRecords");

            migrationBuilder.DropTable(
                name: "LeaveBalances");

            migrationBuilder.DropTable(
                name: "PermissionApis");

            migrationBuilder.DropTable(
                name: "LeaveTypes");

            migrationBuilder.DropIndex(
                name: "IX_LeaveRecords_LeaveTypeId",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "ApprovalStage",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "AttachmentPath",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "EndDate",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "HalfDayType",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "Reason",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "LeaveRecords");

            migrationBuilder.DropColumn(
                name: "TotalDays",
                table: "LeaveRecords");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "LeaveRecords",
                newName: "LeaveType");

            migrationBuilder.RenameColumn(
                name: "StartDate",
                table: "LeaveRecords",
                newName: "Date");

            migrationBuilder.RenameColumn(
                name: "LeaveTypeId",
                table: "LeaveRecords",
                newName: "Hours");

            migrationBuilder.AddColumn<int>(
                name: "ApiId",
                table: "Permissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_ApiId",
                table: "Permissions",
                column: "ApiId");

            migrationBuilder.AddForeignKey(
                name: "FK_Permissions_Apis_ApiId",
                table: "Permissions",
                column: "ApiId",
                principalTable: "Apis",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
