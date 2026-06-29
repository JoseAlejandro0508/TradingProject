using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Meta.Application;

namespace Meta_xi.Application;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly DBContext _context;


    public ChatController(DBContext context)
    {
        _context = context;
    }

    public class MessageRequest
    {
        public string Message { get; set; }
        public string UserPhone { get; set; }
        public bool IsFromAdmin { get; set; }
    }
    [HttpPost("AddMessage")]
    public async Task<IActionResult> AddMessage([FromBody] MessageRequest MR)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == MR.UserPhone);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }
        await _context.ChatSupport.AddAsync(
            new Chat
            {
                UID = user.Id,
                IsFromAdmin = MR.IsFromAdmin,
                Message = MR.Message,

            }
        );
        await _context.SaveChangesAsync();
        return Ok("Mensaje Agregado");


    }

    public class ChatMessage
    {
        public string type{get;set;} = "user";
        public string text{get;set;}="";
    }   
    [HttpGet("GetMessages/{phone}")]
    public async Task<IActionResult> GetMessages(string phone)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.PhoneNumber == phone);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }
        var Messages = await _context.ChatSupport.Where(ch => ch.UID == user.Id).Take(100).ToListAsync();

        var ParsedMessages = Messages.Select(ch => new ChatMessage
        {
            type=ch.IsFromAdmin?"system":"user",
            text=ch.Message,

        });
     
        return Ok(ParsedMessages);


    }

}