using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Meta_xi.Application;

public class UserActivePlan
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public required string Username { get; set; }
    
    [Required]
    public required int BotPlanId { get; set; }
    
    [ForeignKey("BotPlanId")]
    public BotPlan BotPlan { get; set; } = null!;
    
    [Required]
    public required DateTime StartedAt { get; set; }
    
    [Required]
    public required DateTime ExpiresAt { get; set; }
    
    public DateTime LastTradeAt { get; set; }
    
    [Range(0, double.MaxValue)]
    public decimal AccumulatedProfit { get; set; }
    
    [Required]
    [RegularExpression("Active|Paused|Completed", ErrorMessage = "Status must be Active, Paused, or Completed")]
    public required string Status { get; set; } = "Active";
    
    // Cost at time of purchase (to track ROI)
    [Range(0, double.MaxValue)]
    public decimal AcquisitionCost { get; set; }
    public UserActivePlan()
    {
        LastTradeAt=DateTime.Now;
    }
}
