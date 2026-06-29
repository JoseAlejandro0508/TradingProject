using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;
public class Chat
{
    [Key]
    public int Id { get; set; }
    public required int UID { get; set; }
    public required bool  IsFromAdmin { get; set; }
    public required string Message{ get; set; }
    
    public  DateTimeOffset CreatedAt { get; set; }
    public Chat()
    {
        CreatedAt = DateTimeOffset.Now;
    }
}