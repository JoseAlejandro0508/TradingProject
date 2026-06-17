using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;

public class UserFreeBotUsage
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    public required string Username { get; set; }
    
    [Required]
    public required int BotPlanId { get; set; }
    
    [Required]
    [Range(0, int.MaxValue)]
    public required int UsageCount { get; set; }
    
    public DateTime? FirstUsedAt { get; set; }
    
    public DateTime? LastUsedAt { get; set; }
    
    // Computed property: eligible if usage count is less than 3
    public bool IsEligible => UsageCount < 3;
}
