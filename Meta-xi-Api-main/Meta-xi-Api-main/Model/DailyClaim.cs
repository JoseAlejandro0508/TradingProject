using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;

public class DailyClaim
{
    [Key]
    public int Id { get; set; }
    public required int UserId { get; set; }
    public required string Email { get; set; }
    public float Amount { get; set; } = 140;
    public DateTimeOffset ClaimedAt { get; set; } = DateTimeOffset.Now;
}