using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedPermissionDataV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Seed Permissions table - one permission per API
            migrationBuilder.Sql(@"
                INSERT INTO [Permissions] (Name, Description, ApiId, IsSensitive)
                SELECT 
                    a.Name,
                    a.Description,
                    a.Id,
                    a.IsSensitive
                FROM [Apis] a
                WHERE NOT EXISTS (SELECT 1 FROM [Permissions] p WHERE p.ApiId = a.Id)
            ");

            // Link all permissions to the Admin permission set (Id = 1)
            migrationBuilder.Sql(@"
                INSERT INTO [PermissionSetPermissions] (PermissionSetId, PermissionId)
                SELECT 1, p.Id
                FROM [Permissions] p
                WHERE NOT EXISTS (SELECT 1 FROM [PermissionSetPermissions] psp WHERE psp.PermissionSetId = 1 AND psp.PermissionId = p.Id)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DELETE FROM [PermissionSetPermissions] WHERE PermissionSetId = 1");
            migrationBuilder.Sql("DELETE FROM [Permissions]");
        }
    }
}