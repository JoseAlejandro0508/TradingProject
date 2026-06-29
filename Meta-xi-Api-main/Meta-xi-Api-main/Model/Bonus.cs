using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;
public class Bonus
{
    [Key]
    public int Id { get; set; }

    public required int  amount { get; set; }
    public required double reward{ get; set; }
    public required string BonusID{ get; set; }
    
    public  DateTimeOffset CreatedAt { get; set; }
    public Bonus()
    {
        CreatedAt = DateTimeOffset.Now;
    }
}