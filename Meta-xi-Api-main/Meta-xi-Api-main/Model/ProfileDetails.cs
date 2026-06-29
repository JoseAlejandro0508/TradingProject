using System.ComponentModel.DataAnnotations;

namespace Meta_xi.Application;
public class ProfileDetails
{
    [Key]
    public int Id { get; set; }
    public int UserId { get; set; }
    public  string? ProfileName { get; set; }
    public string? RealName { get; set; }
    public int Age { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? DocumentType { get; set; }
    public string? DocumentNumber { get; set; }
    public bool DarkMode=true;


}