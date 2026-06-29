using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Meta_xi.Migrations
{
    /// <inheritdoc />
    public partial class ProfileDetails1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfileDetails_Users_UserId",
                table: "ProfileDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProfileDetails",
                table: "ProfileDetails");

            migrationBuilder.RenameTable(
                name: "ProfileDetails",
                newName: "ProfileDetails_");

            migrationBuilder.RenameIndex(
                name: "IX_ProfileDetails_UserId",
                table: "ProfileDetails_",
                newName: "IX_ProfileDetails__UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProfileDetails_",
                table: "ProfileDetails_",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "WithdrawAccounts_",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false),
                    Method = table.Column<string>(type: "TEXT", nullable: false),
                    AccountNumber = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WithdrawAccounts_", x => x.Id);
                });

            migrationBuilder.AddForeignKey(
                name: "FK_ProfileDetails__Users_UserId",
                table: "ProfileDetails_",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ProfileDetails__Users_UserId",
                table: "ProfileDetails_");

            migrationBuilder.DropTable(
                name: "WithdrawAccounts_");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ProfileDetails_",
                table: "ProfileDetails_");

            migrationBuilder.RenameTable(
                name: "ProfileDetails_",
                newName: "ProfileDetails");

            migrationBuilder.RenameIndex(
                name: "IX_ProfileDetails__UserId",
                table: "ProfileDetails",
                newName: "IX_ProfileDetails_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ProfileDetails",
                table: "ProfileDetails",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ProfileDetails_Users_UserId",
                table: "ProfileDetails",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
