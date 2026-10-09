using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessUnit : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BusinessUnitId",
                table: "Projects",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BusinessUnitId",
                table: "Allocations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BusinessUnits",
                columns: table => new
                {
                    BusinessUnitId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BusinessUnits", x => x.BusinessUnitId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_BusinessUnitId",
                table: "Projects",
                column: "BusinessUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_Allocations_BusinessUnitId",
                table: "Allocations",
                column: "BusinessUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Allocations_BusinessUnits_BusinessUnitId",
                table: "Allocations",
                column: "BusinessUnitId",
                principalTable: "BusinessUnits",
                principalColumn: "BusinessUnitId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Projects_BusinessUnits_BusinessUnitId",
                table: "Projects",
                column: "BusinessUnitId",
                principalTable: "BusinessUnits",
                principalColumn: "BusinessUnitId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Allocations_BusinessUnits_BusinessUnitId",
                table: "Allocations");

            migrationBuilder.DropForeignKey(
                name: "FK_Projects_BusinessUnits_BusinessUnitId",
                table: "Projects");

            migrationBuilder.DropTable(
                name: "BusinessUnits");

            migrationBuilder.DropIndex(
                name: "IX_Projects_BusinessUnitId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Allocations_BusinessUnitId",
                table: "Allocations");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "BusinessUnitId",
                table: "Allocations");
        }
    }
}
