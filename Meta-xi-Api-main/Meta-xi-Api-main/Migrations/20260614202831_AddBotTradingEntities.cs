using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Meta_xi.Migrations
{
    /// <inheritdoc />
    public partial class AddBotTradingEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BotPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Description = table.Column<string>(type: "TEXT", nullable: false),
                    Price = table.Column<decimal>(type: "TEXT", nullable: false),
                    DailyProfitEstimate = table.Column<decimal>(type: "TEXT", nullable: false),
                    DurationDays = table.Column<int>(type: "INTEGER", nullable: false),
                    TradingPair = table.Column<string>(type: "TEXT", nullable: false),
                    WinRate = table.Column<double>(type: "REAL", nullable: true),
                    IsFreeTier = table.Column<bool>(type: "INTEGER", nullable: false),
                    FreeTierMaxUses = table.Column<int>(type: "INTEGER", nullable: true),
                    ImageUrl = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BotPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserFreeBotUsages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    BotPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    UsageCount = table.Column<int>(type: "INTEGER", nullable: false),
                    FirstUsedAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    LastUsedAt = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserFreeBotUsages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserActivePlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    BotPlanId = table.Column<int>(type: "INTEGER", nullable: false),
                    StartedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastTradeAt = table.Column<DateTime>(type: "TEXT", nullable: true),
                    AccumulatedProfit = table.Column<decimal>(type: "TEXT", nullable: false),
                    Status = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserActivePlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserActivePlans_BotPlans_BotPlanId",
                        column: x => x.BotPlanId,
                        principalTable: "BotPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "BotPlans",
                columns: new[] { "Id", "DailyProfitEstimate", "Description", "DurationDays", "FreeTierMaxUses", "ImageUrl", "IsFreeTier", "Name", "Price", "TradingPair", "WinRate" },
                values: new object[,]
                {
                    { 1, 1500m, "Bot de alta frecuencia para trading de Bitcoin. Aprovecha micro-movimientos del mercado con 72% de efectividad.", 30, 3, "/bots/btc-scalper.webp", true, "BTC Scalper Bot", 0m, "BTC/USDT", 0.71999999999999997 },
                    { 2, 3500m, "Estrategia de grid trading en Ethereum. Opera en rangos de precio predefinidos para capturar beneficios consistentes.", 30, null, "/bots/eth-grid.webp", false, "ETH Grid Bot", 50000m, "ETH/USDT", 0.68000000000000005 },
                    { 3, 5200m, "Bot que sigue la tendencia de Solana. Ideal para mercados alcistas con alto volumen.", 30, null, "/bots/sol-momentum.webp", false, "SOL Momentum Bot", 75000m, "SOL/USDT", 0.65000000000000002 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserActivePlans_BotPlanId",
                table: "UserActivePlans",
                column: "BotPlanId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserActivePlans");

            migrationBuilder.DropTable(
                name: "UserFreeBotUsages");

            migrationBuilder.DropTable(
                name: "BotPlans");
        }
    }
}
