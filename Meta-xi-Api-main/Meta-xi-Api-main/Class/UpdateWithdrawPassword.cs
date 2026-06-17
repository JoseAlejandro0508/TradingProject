namespace Meta_xi.Application;
public class UpdateWithdrawPassword
{
    public required string Username { get; set; }
    public string? OldWithdrawPassword { get; set; }
    public required string NewWithdrawPassword { get; set; }
}
