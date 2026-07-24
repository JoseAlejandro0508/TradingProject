using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meta_xi.Application;

[ApiController]
[Route("api/[controller]")]
public class ReferController : ControllerBase
{
    private readonly DBContext context;
    private ReferService referService;
    public ReferController(DBContext dbcontext, ReferService _referService)
    {
        context = dbcontext;
        referService = _referService;
    }
    public class TeamInfo
    {
        public int CountLVL1 { get; set; }
        public int CountLVL2 { get; set; }
        public int CountLVL3 { get; set; }
        public int CountLVL4 { get; set; }
        public double EarnLVL1 { get; set; }
        public double EarnLVL2 { get; set; }
        public double EarnLVL3 { get; set; }
        public double EarnLVL4 { get; set; }
        public int CountTotal { get; set; }
        public int CountToday { get; set; }
        public double TeamRecharge { get; set; }
        public double TeamWithdraw { get; set; }



    }
    public class LatestResponse
    {
        public int Level { get; set; }
        public string Name { get; set; }
        public string Initials { get; set; }
        public string DateInfo { get; set; }
    }
    [HttpGet("LatestRefers/{id}")]
    public async Task<IActionResult> LatestRefers(string id)
    {

        string RegisterDate(DateTimeOffset date){
            DateTimeOffset now = DateTimeOffset.Now;
            TimeSpan timeDifference = now - date;
            if (timeDifference.TotalSeconds < 60)
            {
                return "Hace un momento";
            }
            else if (timeDifference.TotalMinutes < 60)
            {
                return $"Hace {timeDifference.TotalMinutes:F0} minutos";
            }
            else if (timeDifference.TotalHours < 24)
            {
                return $"Hace {timeDifference.TotalHours:F0} horas";
            }
            else
            {
                return $"Hace {timeDifference.TotalDays:F0} días";
            }
        }
        var user = await context.Users.Include(u => u.ProfileDetails).Where(u => u.PhoneNumber == id).FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound("Usuario no encontrado");
        }


        var refer = await referService.GetCurrentRef(user.Id, 0);
        List<(int level,User u)> latestRefers = new List<(int level, User u)>();
        for(int i = 1; i <= 4; i++)
        {
            foreach(var u in refer[i])
            {
                var date=(i,u);
                latestRefers.Add(date);
            }
            
        }
        latestRefers = latestRefers.OrderByDescending(x => x.u.CreatedAt).Take(4).ToList();

        List<LatestResponse> response =latestRefers.Select(x => new LatestResponse
        {
            Level = x.level,
            Name = x.u.ProfileDetails==null?"Anonymus":x.u.ProfileDetails.ProfileName,
            Initials = string.Join("", x.u.ProfileDetails==null?"":x.u.ProfileDetails.ProfileName.Split(' ').Select(n => n[0])).ToUpper(),
            DateInfo = RegisterDate(x.u.CreatedAt)
        }).ToList();
        return Ok(response);


      
    }
    [HttpGet("GetReferrer/{id}")]
    public async Task<IActionResult> GetRefered(string id)
    {
        var user = await context.Users.Where(u => u.PhoneNumber == id).FirstOrDefaultAsync();
        if (user == null)
        {
            return NotFound("Usuario no encontrado");
        }
        var refer = await referService.GetCurrentRef(user.Id, 0);
        var referToday = await referService.GetCurrentRef(user.Id, 3600 * 24);
        double TotalDeposit = 0, TotalWithdraw = 0;
        Dictionary<int, double> referEarn = new Dictionary<int, double>
        {
            { 1, 0 },
            { 2, 0 },
            { 3, 0 },
            { 4, 0 }
        };
        Dictionary<int, double> Comision = new Dictionary<int, double>
        {
            { 1, 0.08 },
            { 2, 0.04 },
            { 3, 0.02 },
            { 4, 0.01 }

        };
        for (int i = 1; i <= 4; i++)
        {
            foreach (var u in refer[i])
            {
                var userWallet = await context.Wallets.FirstOrDefaultAsync(option => option.Email == u.Email);
                if (userWallet == null) continue;

                TotalDeposit += userWallet.TotalRecharged;
                TotalWithdraw += userWallet.TotalWithdrawn;
                referEarn[i] += userWallet.TotalRecharged * Comision[i];
            }

        }



        TeamInfo quantityRefersLevelsBack = new TeamInfo
        {
            CountLVL1 = refer[1].Count,
            CountLVL2 = refer[2].Count,
            CountLVL3 = refer[3].Count,
            CountLVL4 = refer[4].Count,
            EarnLVL1 = referEarn[1],
            EarnLVL2 = referEarn[2],
            EarnLVL3 = referEarn[3],
            EarnLVL4 = referEarn[4],
            CountTotal = refer[1].Count + refer[2].Count + refer[3].Count + refer[4].Count,
            CountToday = referToday[1].Count + referToday[2].Count + referToday[3].Count + referToday[4].Count,
            TeamRecharge = TotalDeposit,
            TeamWithdraw = TotalWithdraw

        };
        return Ok(quantityRefersLevelsBack);
    }
}