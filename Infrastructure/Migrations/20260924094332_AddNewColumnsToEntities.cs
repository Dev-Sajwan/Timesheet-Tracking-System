using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNewColumnsToEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LeaveId",
                table: "LeaveRecords",
                newName: "LeaveRecordId");

            migrationBuilder.RenameColumn(
                name: "BenchId",
                table: "BenchHours",
                newName: "BenchHourId");

            migrationBuilder.AddColumn<DateTime>(
                name: "WeekEndDate",
                table: "Timesheets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "WeekStartDate",
                table: "Timesheets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "TimesheetEntry",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TimesheetId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Hours = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimesheetEntry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TimesheetEntry_Timesheets_TimesheetId",
                        column: x => x.TimesheetId,
                        principalTable: "Timesheets",
                        principalColumn: "TimesheetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TimesheetEntry_TimesheetId",
                table: "TimesheetEntry",
                column: "TimesheetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TimesheetEntry");

            migrationBuilder.DropColumn(
                name: "WeekEndDate",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "WeekStartDate",
                table: "Timesheets");

            migrationBuilder.RenameColumn(
                name: "LeaveRecordId",
                table: "LeaveRecords",
                newName: "LeaveId");

            migrationBuilder.RenameColumn(
                name: "BenchHourId",
                table: "BenchHours",
                newName: "BenchId");
        }
    }
}
