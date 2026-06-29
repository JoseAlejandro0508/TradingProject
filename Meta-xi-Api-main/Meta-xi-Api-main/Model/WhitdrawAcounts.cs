using System.ComponentModel.DataAnnotations;

public class WithdrawAccounts
{
    [Key]
    public int Id { get; set; }
    
    public required int UserId { get; set; }

    public required string Method { get; set; }
    public required string AccountNumber { get; set; }


}