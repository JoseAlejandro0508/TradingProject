using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;

public class BotPlan
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public required string Name { get; set; }
    
    [Required]
    public required string Description { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public required decimal Price { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public required decimal DailyProfitEstimate { get; set; }
    
    [Required]
    [Range(1, int.MaxValue)]
    public required int DurationDays { get; set; }
    
    [Required]
    public required string TradingPair { get; set; }
    
    [Range(0, 1)]
    public double? WinRate { get; set; }
    
    [Required]
    public required bool IsFreeTier { get; set; }
    
    public int? FreeTierMaxUses { get; set; }
    
    public string? ImageUrl { get; set; }
    
    // Comma-separated list of exchanges (e.g., "Binance,Coinbase,Kraken")
    public string? Exchanges { get; set; }
    
    // Stock availability (max units available)
    [Range(1, int.MaxValue)]
    public int? StockMax { get; set; }
    
    // Buy percentage for analytics display (e.g., 54.2)
    [Range(0, 100)]
    public double? BuyPercentage { get; set; }
    
    // Sell percentage for analytics display (e.g., 45.8)
    [Range(0, 100)]
    public double? SellPercentage { get; set; }
    
    // Icon color for the bot (hex color code, e.g., "#00c853")
    public string? IconColor { get; set; }
    
    // Total profit at the end of duration (calculated: DailyProfitEstimate * DurationDays)
    [Range(0, double.MaxValue)]
    public decimal? TotalProfitEstimate { get; set; }
}
