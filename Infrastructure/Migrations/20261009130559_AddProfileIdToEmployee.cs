using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileIdToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProfileId",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_ProfileId",
                table: "Employees",
                column: "ProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_Profiles_ProfileId",
                table: "Employees",
                column: "ProfileId",
                principalTable: "Profiles",
                principalColumn: "ProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_Profiles_ProfileId",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_ProfileId",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "ProfileId",
                table: "Employees");
        }
    }
}
