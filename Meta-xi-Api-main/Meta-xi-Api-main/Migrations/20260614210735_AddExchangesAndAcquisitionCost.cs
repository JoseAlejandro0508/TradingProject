using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Meta_xi.Migrations
{
    /// <inheritdoc />
    public partial class AddExchangesAndAcquisitionCost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "AcquisitionCost",
                table: "UserActivePlans",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Exchanges",
                table: "BotPlans",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 1,
                column: "Exchanges",
                value: null);

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 2,
                column: "Exchanges",
                value: null);

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 3,
                column: "Exchanges",
                value: null);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AcquisitionCost",
                table: "UserActivePlans");

            migrationBuilder.DropColumn(
                name: "Exchanges",
                table: "BotPlans");
        }
    }
}
