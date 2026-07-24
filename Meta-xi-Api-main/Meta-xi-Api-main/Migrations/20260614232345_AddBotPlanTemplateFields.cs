using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Meta_xi.Migrations
{
    /// <inheritdoc />
    public partial class AddBotPlanTemplateFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "BuyPercentage",
                table: "BotPlans",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IconColor",
                table: "BotPlans",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "SellPercentage",
                table: "BotPlans",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StockMax",
                table: "BotPlans",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalProfitEstimate",
                table: "BotPlans",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "BuyPercentage", "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "FreeTierMaxUses", "IconColor", "ImageUrl", "Name", "SellPercentage", "StockMax", "TotalProfitEstimate" },
                values: new object[] { 54.200000000000003, 300m, "Bot de alta frecuencia para trading de Bitcoin. Aprovecha micro-movimientos del mercado con alta efectividad. Uso gratuito limitado.", 300, "Binance,KuCoin", 1, "#00c853", "/bots/free-bot.webp", "Free Bot", 45.799999999999997, 1, 3500m });

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "BuyPercentage", "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "IconColor", "ImageUrl", "Name", "Price", "SellPercentage", "StockMax", "TotalProfitEstimate" },
                values: new object[] { 59.100000000000001, 900m, "Estrategia de grid trading en Ethereum con enfoque en exchanges asiáticos. Opera en rangos de precio predefinidos.", 228, "Bybit,MEXC", "#ffa929", "/bots/byte-bot.webp", "Byte Bot", 30000m, 40.899999999999999, 2, 205200m });

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "BuyPercentage", "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "IconColor", "ImageUrl", "Name", "Price", "SellPercentage", "StockMax", "TotalProfitEstimate", "TradingPair", "WinRate" },
                values: new object[] { 61.899999999999999, 1500m, "Bot institucional de alto rendimiento para Ethereum. Diseñado para mercados con alta liquidez.", 240, "OKX,Gate.io", "#e9ecef", "/bots/cronos-bot.webp", "Cronos Bot", 50000m, 38.100000000000001, 2, 360000m, "ETH/USDT", 0.75 });

            migrationBuilder.InsertData(
                table: "BotPlans",
                columns: new[] { "Id", "BuyPercentage", "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "FreeTierMaxUses", "IconColor", "ImageUrl", "IsFreeTier", "Name", "Price", "SellPercentage", "StockMax", "TotalProfitEstimate", "TradingPair", "WinRate" },
                values: new object[,]
                {
                    { 4, 57.600000000000001, 3300m, "Especializado en Solana con estrategia de momentum. Ideal para capturar movimientos fuertes del mercado.", 260, "Coinbase,Kraken", null, "#0052ff", "/bots/abstrar-bot.webp", false, "Abstrar Bot", 100000m, 42.399999999999999, 2, 858000m, "SOL/USDT", 0.69999999999999996 },
                    { 5, 64.5, 5100m, "Bot premium para Bitcoin con múltiples nodos de ejecución. Máxima velocidad en operaciones de alta frecuencia.", 290, "Bitget,HTX,Binance", null, "#00f0ff", "/bots/atlas-bot.webp", false, "Atlas Bot", 150000m, 35.5, 2, 1479000m, "BTC/USDT", 0.78000000000000003 },
                    { 6, 52.100000000000001, 10800m, "Bot de arbitraje entre exchanges coreanos y globales. Aprovecha diferencias de precio en tiempo real.", 300, "Upbit,Binance", null, "#004fff", "/bots/nexus-bot.webp", false, "Nexus Bot", 300000m, 47.899999999999999, 1, 3240000m, "ETH/USDT", 0.76000000000000001 },
                    { 7, 56.399999999999999, 18000m, "Estrategia de scalping avanzada para Bitcoin. Múltiples operaciones por día con gestión de riesgo optimizada.", 320, "KuCoin,Gate.io", null, "#00b57a", "/bots/nova-bot.webp", false, "Nova Bot", 500000m, 43.600000000000001, 2, 5760000m, "BTC/USDT", 0.80000000000000004 },
                    { 8, 62.799999999999997, 29600m, "Bot de trading algorítmico de última generación. Machine learning aplicado al análisis de mercado.", 340, "Bybit,OKX", null, "#ffa929", "/bots/optix-bot.webp", false, "Optix Bot", 800000m, 37.200000000000003, 1, 10064000m, "BTC/USDT", 0.81999999999999995 },
                    { 9, 67.099999999999994, 38000m, "Sistema institucional de trading cuantitativo. Estrategias de alta frecuencia con ejecución en milisegundos.", 380, "MEXC,Coinbase,Kraken", null, "#00b0ff", "/bots/sigma-bot.webp", false, "Sigma Bot", 1000000m, 32.899999999999999, 1, 14440000m, "BTC/USDT", 0.84999999999999998 },
                    { 10, 69.400000000000006, 62400m, "El bot más avanzado de nuestra plataforma. Estrategia multi-exchange con liquidez profunda y ejecución ultra-rápida.", 420, "HTX,Upbit,Bitget", null, "#1a6ed1", "/bots/flux-bot.webp", false, "Flux Bot", 1600000m, 30.600000000000001, 1, 26208000m, "BTC/USDT", 0.88 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 9);

            migrationBuilder.DeleteData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 10);

            migrationBuilder.DropColumn(
                name: "BuyPercentage",
                table: "BotPlans");

            migrationBuilder.DropColumn(
                name: "IconColor",
                table: "BotPlans");

            migrationBuilder.DropColumn(
                name: "SellPercentage",
                table: "BotPlans");

            migrationBuilder.DropColumn(
                name: "StockMax",
                table: "BotPlans");

            migrationBuilder.DropColumn(
                name: "TotalProfitEstimate",
                table: "BotPlans");

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "FreeTierMaxUses", "ImageUrl", "Name" },
                values: new object[] { 1500m, "Bot de alta frecuencia para trading de Bitcoin. Aprovecha micro-movimientos del mercado con 72% de efectividad.", 30, null, 3, "/bots/btc-scalper.webp", "BTC Scalper Bot" });

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "ImageUrl", "Name", "Price" },
                values: new object[] { 3500m, "Estrategia de grid trading en Ethereum. Opera en rangos de precio predefinidos para capturar beneficios consistentes.", 30, null, "/bots/eth-grid.webp", "ETH Grid Bot", 50000m });

            migrationBuilder.UpdateData(
                table: "BotPlans",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "DailyProfitEstimate", "Description", "DurationDays", "Exchanges", "ImageUrl", "Name", "Price", "TradingPair", "WinRate" },
                values: new object[] { 5200m, "Bot que sigue la tendencia de Solana. Ideal para mercados alcistas con alto volumen.", 30, null, "/bots/sol-momentum.webp", "SOL Momentum Bot", 75000m, "SOL/USDT", 0.65000000000000002 });
        }
    }
}
