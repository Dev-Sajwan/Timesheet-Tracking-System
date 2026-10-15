using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePermissionToManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create PermissionApis junction table
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

            migrationBuilder.CreateIndex(
                name: "IX_PermissionApis_ApiId",
                table: "PermissionApis",
                column: "ApiId");

            // Migrate existing data: each Permission had one ApiId, move to PermissionApis
            migrationBuilder.Sql(@"
                INSERT INTO [PermissionApis] (PermissionId, ApiId)
                SELECT Id, ApiId FROM [Permissions] WHERE ApiId IS NOT NULL AND ApiId > 0
            ");

            // Drop the old ApiId column and FK from Permissions
            migrationBuilder.DropForeignKey(
                name: "FK_Permissions_Apis_ApiId",
                table: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_Permissions_ApiId",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "ApiId",
                table: "Permissions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Add back ApiId column
            migrationBuilder.AddColumn<int>(
                name: "ApiId",
                table: "Permissions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Migrate back: take first Api from PermissionApis for each Permission
            migrationBuilder.Sql(@"
                UPDATE [Permissions] 
                SET ApiId = (SELECT TOP 1 ApiId FROM [PermissionApis] WHERE PermissionId = [Permissions].Id)
                WHERE Id IN (SELECT PermissionId FROM [PermissionApis])
            ");

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

            migrationBuilder.DropTable(
                name: "PermissionApis");
        }
    }
}