using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;
public class ClaimRegister
{
    [Key]
    public int Id { get; set; }

    public required int  UID { get; set; }
 
    public required string BonusID{ get; set; }
    public string state{ get; set; }="Completado";
    
    public  DateTimeOffset CreatedAt { get; set; }
    public ClaimRegister()
    {
        CreatedAt = DateTimeOffset.Now;
    }
}