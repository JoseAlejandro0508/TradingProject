using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meta_xi.Application;

[ApiController]
[Route("api/[controller]")]
public class BonusController : ControllerBase
{
    private readonly DBContext context;
    private ReferService referService;
    public BonusController(DBContext dbcontext, ReferService _referService)
    {
        context = dbcontext;
        referService = _referService;
    }
    public class BonusRequest
    {
        public int amount { get; set; }
        public string BonusID { get; set; }
        public double reward { get; set; }

    }
    [HttpPost("AddBonus")]
    public async Task<IActionResult> AddBonus(BonusRequest Bonus_)
    {

        await context.BonusRegister.AddAsync(new Bonus
        {
            BonusID = Bonus_.BonusID,
            amount = Bonus_.amount,
            reward = Bonus_.reward,

        });
        await context.SaveChangesAsync();
        return Ok("Operación exitosa");


    }
    public class ClaimBonusRequest
    {
        public string PhoneNumber { get; set; }
        public string BonusID { get; set; }


    }
    [HttpPost("ClaimBonus")]
    public async Task<IActionResult> ClaimBonus(ClaimBonusRequest Bonus_)
    {


        var user = await context.Users.Where(u => u.PhoneNumber == Bonus_.PhoneNumber).FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound("Usuario no encontrado");
        }
        var SelectedBonus = await context.BonusRegister.Where(b => b.BonusID == Bonus_.BonusID).FirstOrDefaultAsync();
        if (SelectedBonus == null)
        {
            await context.BonusClaimRegister.AddAsync(new ClaimRegister
            {
                UID = user.Id,
                BonusID = Bonus_.BonusID,
                state = "Inválido"

            });
            await context.SaveChangesAsync();
            return NotFound("Bonus Inválido");
        }
        if (SelectedBonus.amount <= 0)
        {
            return BadRequest("Bonus Agotado");
        }

        bool AlreadyClaim = await context.BonusClaimRegister.AnyAsync(bcr => bcr.BonusID == Bonus_.BonusID && bcr.UID == user.Id);
        if (AlreadyClaim)
        {
            await context.BonusClaimRegister.AddAsync(new ClaimRegister
            {
                UID = user.Id,
                BonusID = Bonus_.BonusID,
                state = "Ya usado"

            });
            await context.SaveChangesAsync();
            return BadRequest("Ya el usuario ha reclamado ese bono");
        }
        await context.BonusClaimRegister.AddAsync(new ClaimRegister
        {
            UID = user.Id,
            BonusID = Bonus_.BonusID

        });

        var wallet = await context.Wallets.FirstOrDefaultAsync(option => option.Email == user.Email);
        if (wallet != null)
        {
            SelectedBonus.amount--;
            wallet.Balance += (float)SelectedBonus!.reward;

            context.Entry(wallet).State = EntityState.Modified;
            context.Entry(SelectedBonus).State = EntityState.Modified;

        }
        await context.SaveChangesAsync();
        return Ok("Operación exitosa");

    }
    public class BonusHistorialResponse
    {
        public double reward { get; set; }
        public string BonusID { get; set; }
        public string Date { get; set; }
        public string state { get; set; }
        public bool error { get; set; } 

    }
    [HttpGet("BonusHistorial/{phone}")]
    public async Task<IActionResult> BonusHistorial(string phone)
    {
        var user = await context.Users.Where(u => u.PhoneNumber == phone).FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound("Usuario no encontrado");
        }
        var BonusData = await context.BonusRegister.ToDictionaryAsync(bd => bd.BonusID, bd => bd.reward);


        var ClaimRegister = await context.BonusClaimRegister.Where(bc => bc.UID == user.Id).ToListAsync();
        var ResponseHistorial = ClaimRegister.Select(cr => new BonusHistorialResponse
        {
            reward = BonusData.ContainsKey(cr.BonusID) ? BonusData[cr.BonusID] : 0,
            BonusID = cr.BonusID,
            Date = cr.CreatedAt.ToString(),
            state=cr.state,
            error=cr.state=="Completado"?false:true

        });



        return Ok(ResponseHistorial);

    }



}