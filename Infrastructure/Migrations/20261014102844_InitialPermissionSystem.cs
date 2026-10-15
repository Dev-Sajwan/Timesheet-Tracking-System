using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialPermissionSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissionPermissionSet");

            migrationBuilder.DropTable(
                name: "RolePermissionSets");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PermissionSets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "IsAssignable",
                table: "PermissionSets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystem",
                table: "PermissionSets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PermissionSets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "Apis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Route = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    HttpMethod = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Controller = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsSensitive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Apis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPermissionSets",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    PermissionSetId = table.Column<int>(type: "int", nullable: false),
                    AssignedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AssignedBy = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPermissionSets", x => new { x.UserId, x.PermissionSetId });
                    table.ForeignKey(
                        name: "FK_UserPermissionSets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserPermissionSets_PermissionSets_PermissionSetId",
                        column: x => x.PermissionSetId,
                        principalTable: "PermissionSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PermissionSetApis",
                columns: table => new
                {
                    PermissionSetId = table.Column<int>(type: "int", nullable: false),
                    ApiId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionSetApis", x => new { x.PermissionSetId, x.ApiId });
                    table.ForeignKey(
                        name: "FK_PermissionSetApis_Apis_ApiId",
                        column: x => x.ApiId,
                        principalTable: "Apis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermissionSetApis_PermissionSets_PermissionSetId",
                        column: x => x.PermissionSetId,
                        principalTable: "PermissionSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Apis_Route_HttpMethod",
                table: "Apis",
                columns: new[] { "Route", "HttpMethod" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PermissionSetApis_ApiId",
                table: "PermissionSetApis",
                column: "ApiId");

            migrationBuilder.CreateIndex(
                name: "IX_UserPermissionSets_PermissionSetId",
                table: "UserPermissionSets",
                column: "PermissionSetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PermissionSetApis");

            migrationBuilder.DropTable(
                name: "UserPermissionSets");

            migrationBuilder.DropTable(
                name: "Apis");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PermissionSets");

            migrationBuilder.DropColumn(
                name: "IsAssignable",
                table: "PermissionSets");

            migrationBuilder.DropColumn(
                name: "IsSystem",
                table: "PermissionSets");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "PermissionSets");

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissionSets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PermissionSetId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissionSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissionSets_PermissionSets_PermissionSetId",
                        column: x => x.PermissionSetId,
                        principalTable: "PermissionSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PermissionPermissionSet",
                columns: table => new
                {
                    PermissionSetsId = table.Column<int>(type: "int", nullable: false),
                    PermissionsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionPermissionSet", x => new { x.PermissionSetsId, x.PermissionsId });
                    table.ForeignKey(
                        name: "FK_PermissionPermissionSet_PermissionSets_PermissionSetsId",
                        column: x => x.PermissionSetsId,
                        principalTable: "PermissionSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PermissionPermissionSet_Permissions_PermissionsId",
                        column: x => x.PermissionsId,
                        principalTable: "Permissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PermissionPermissionSet_PermissionsId",
                table: "PermissionPermissionSet",
                column: "PermissionsId");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissionSets_PermissionSetId",
                table: "RolePermissionSets",
                column: "PermissionSetId");
        }
    }
}
