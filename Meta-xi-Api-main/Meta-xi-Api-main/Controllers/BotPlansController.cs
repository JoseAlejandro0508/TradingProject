
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Meta_xi.Application;

[ApiController]
[Route("api/[controller]")]
public class BotPlansController : ControllerBase
{
    private readonly DBContext _context;

    public BotPlansController(DBContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all available bot plans
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var botPlans = await _context.BotPlans
            .Select(bp => new BotPlanDTO
            {
                Id = bp.Id,
                Name = bp.Name,
                Description = bp.Description,
                Price = bp.Price,
                DailyProfitEstimate = bp.DailyProfitEstimate,
                DurationDays = bp.DurationDays,
                TradingPair = bp.TradingPair,
                WinRate = bp.WinRate,
                IsFreeTier = bp.IsFreeTier,
                FreeTierMaxUses = bp.FreeTierMaxUses,
                ImageUrl = bp.ImageUrl,
                Exchanges = !string.IsNullOrEmpty(bp.Exchanges)
                    ? bp.Exchanges.Split(',', StringSplitOptions.RemoveEmptyEntries).ToList()
                    : new List<string>(),
                StockMax = bp.StockMax ?? 1,
                BuyPercentage = bp.BuyPercentage ?? 50,
                SellPercentage = bp.SellPercentage ?? 50,
                IconColor = bp.IconColor ?? "#2962ff",
                TotalProfitEstimate = bp.TotalProfitEstimate ?? (bp.DailyProfitEstimate * bp.DurationDays)
            })
            .ToListAsync();

        return Ok(botPlans);
    }

    /// <summary>
    /// Get user's active bot plans
    /// </summary>
    [HttpGet("MyBots/{username}")]
    public async Task<IActionResult> GetMyBots(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == username || u.PhoneNumber == username);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }
        DateTime Today = DateTime.Now;
        var activePlans = await _context.UserActivePlans
            .Where(uap => uap.Username == username && (uap.ExpiresAt>Today))
            .Include(uap => uap.BotPlan)
            .Select(uap => new UserActivePlanDTO
            {
                Id = uap.Id,
                BotPlanId = uap.BotPlanId,
                BotPlanName = uap.BotPlan.Name,
                BotPlanImageUrl = uap.BotPlan.ImageUrl,
                StartedAt = uap.StartedAt,
                ExpiresAt = uap.ExpiresAt,
                LastTradeAt = uap.LastTradeAt,
                AccumulatedProfit = uap.AccumulatedProfit,
                Status = uap.Status,
                TradingPair = uap.BotPlan.TradingPair,
                DailyProfitEstimate = uap.BotPlan.DailyProfitEstimate,
                AcquisitionCost = uap.AcquisitionCost
            })
            .ToListAsync();

        return Ok(activePlans);
    }
    public class ClaimFreeBotRequest
    {
        public required string Username { get; set; }

    }
    /// <summary>
    /// Calim free bot earn
    /// </summary>
    [HttpPost("ClaimFreeBotEarn")]
    public async Task<IActionResult> ClaimFreeBotEarn([FromBody] ClaimFreeBotRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Username || u.PhoneNumber == request.Username);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        var userPlan = await _context.UserActivePlans
            .Where(uap => uap.Username == request.Username)
            .Include(uap => uap.BotPlan)
            .FirstOrDefaultAsync(uap => uap.BotPlan.IsFreeTier && (uap.LastTradeAt == null || uap.LastTradeAt < uap.ExpiresAt));


        if (userPlan == null)
        {
            return BadRequest(new { message = "No eres elegible para reclamar ganancias de este bot gratuito" });
        }

        DateTime Today = DateTime.Now;
        if (Today > userPlan.ExpiresAt)
        {
            Today = userPlan.ExpiresAt;
        }
        double earnPerSecond = (double)userPlan.BotPlan.DailyProfitEstimate / (3600 * 24);
        double totalEarned = Today.Subtract(userPlan.LastTradeAt).TotalSeconds * earnPerSecond;


        userPlan.AccumulatedProfit += (decimal)totalEarned;

        userPlan.LastTradeAt = Today;
        _context.Entry(userPlan).State = EntityState.Modified;

        var wallet = await _context.Wallets.FirstOrDefaultAsync(option => option.Email == userPlan.Username);
        if (wallet != null)
        {
            wallet.Balance += (float)totalEarned;

            _context.Entry(wallet).State = EntityState.Modified;

        }
        await _context.SaveChangesAsync();

        return Ok(new { message = "Ganancias reclamadas exitosamente" });
    }


    /// <summary>
    /// Get free tier usage for a user
    /// </summary>
    [HttpGet("FreeUsage/{username}")]
    public async Task<IActionResult> GetFreeUsage(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == username || u.PhoneNumber == username);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        var freeUsages = await _context.UserFreeBotUsages
            .Where(ufu => ufu.Username == username)
            .Select(ufu => new UserFreeUsageDTO
            {
                BotPlanId = ufu.BotPlanId,
                UsageCount = ufu.UsageCount,
                FirstUsedAt = ufu.FirstUsedAt,
                LastUsedAt = ufu.LastUsedAt,
                IsEligible = ufu.IsEligible
            })
            .ToListAsync();

        return Ok(freeUsages);
    }

    /// <summary>
    /// Deploy a bot plan for a user
    /// </summary>
    [HttpPost("Deploy")]
    public async Task<IActionResult> Deploy([FromBody] DeployBotRequest request)
    {
        // Validate user exists
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Username || u.PhoneNumber == request.Username);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        // Get bot plan
        var botPlan = await _context.BotPlans.FindAsync(request.BotPlanId);
        if (botPlan == null)
        {
            return NotFound(new { message = "Plan de bot no encontrado" });
        }

        // Check free tier limit
        if (botPlan.IsFreeTier)
        {
            var freeUsage = await _context.UserActivePlans
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.BotPlanId == request.BotPlanId);

            if (freeUsage != null)
            {
                return BadRequest(new { message = "Has alcanzado el límite de usos gratuitos para este bot" });
            }
        }
        else
        {
            // Check wallet balance for paid plans
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Email == user.Email);
            if (wallet == null || wallet.Balance < (float)botPlan.Price)
            {
                return BadRequest(new { message = "Saldo insuficiente para adquirir este bot" });
            }

            // Deduct price from wallet
            wallet.Balance -= (float)botPlan.Price;
            _context.Entry(wallet).State = EntityState.Modified;
        }

        // Create active plan
        var activePlan = new UserActivePlan
        {
            Username = request.Username,
            BotPlanId = request.BotPlanId,
            StartedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(botPlan.DurationDays),
            AccumulatedProfit = 0,
            Status = "Active",
            AcquisitionCost = botPlan.IsFreeTier ? 0 : botPlan.Price
        };

        await _context.UserActivePlans.AddAsync(activePlan);

        // Update free usage tracking
        if (botPlan.IsFreeTier)
        {
            var freeUsage = await _context.UserFreeBotUsages
                .FirstOrDefaultAsync(u => u.Username == request.Username && u.BotPlanId == request.BotPlanId);

            if (freeUsage == null)
            {
                freeUsage = new UserFreeBotUsage
                {
                    Username = request.Username,
                    BotPlanId = request.BotPlanId,
                    UsageCount = 1,
                    FirstUsedAt = DateTime.UtcNow,
                    LastUsedAt = DateTime.UtcNow
                };
                await _context.UserFreeBotUsages.AddAsync(freeUsage);
            }
            else
            {
                freeUsage.UsageCount++;
                freeUsage.LastUsedAt = DateTime.UtcNow;
                _context.Entry(freeUsage).State = EntityState.Modified;
            }
        }

        await _context.SaveChangesAsync();

        return Ok(new DeployBotResponse
        {
            Success = true,
            Message = "Bot desplegado exitosamente",
            ActivePlanId = activePlan.Id,
            ExpiresAt = activePlan.ExpiresAt
        });
    }

    /// <summary>
    /// Pause an active bot
    /// </summary>
    [HttpPost("{id}/Pause")]
    public async Task<IActionResult> Pause(int id)
    {
        var activePlan = await _context.UserActivePlans.FindAsync(id);
        if (activePlan == null)
        {
            return NotFound(new { message = "Plan activo no encontrado" });
        }

        if (activePlan.Status != "Active")
        {
            return BadRequest(new { message = "Solo se pueden pausar bots activos" });
        }

        activePlan.Status = "Paused";
        _context.Entry(activePlan).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bot pausado exitosamente", status = activePlan.Status });
    }

    /// <summary>
    /// Resume a paused bot
    /// </summary>
    [HttpPost("{id}/Resume")]
    public async Task<IActionResult> Resume(int id)
    {
        var activePlan = await _context.UserActivePlans.FindAsync(id);
        if (activePlan == null)
        {
            return NotFound(new { message = "Plan activo no encontrado" });
        }

        if (activePlan.Status != "Paused")
        {
            return BadRequest(new { message = "Solo se pueden reanudar bots pausados" });
        }

        activePlan.Status = "Active";
        _context.Entry(activePlan).State = EntityState.Modified;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Bot reanudado exitosamente", status = activePlan.Status });
    }
}

// DTOs
public class BotPlanDTO
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public decimal DailyProfitEstimate { get; set; }
    public int DurationDays { get; set; }
    public required string TradingPair { get; set; }
    public double? WinRate { get; set; }
    public bool IsFreeTier { get; set; }
    public int? FreeTierMaxUses { get; set; }
    public string? ImageUrl { get; set; }
    public List<string> Exchanges { get; set; } = new();
    public int StockMax { get; set; }
    public double BuyPercentage { get; set; }
    public double SellPercentage { get; set; }
    public string IconColor { get; set; } = "#2962ff";
    public decimal TotalProfitEstimate { get; set; }
}

public class UserActivePlanDTO
{
    public int Id { get; set; }
    public int BotPlanId { get; set; }
    public required string BotPlanName { get; set; }
    public string? BotPlanImageUrl { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? LastTradeAt { get; set; }
    public decimal AccumulatedProfit { get; set; }
    public string Status { get; set; } = "Active";
    public required string TradingPair { get; set; }
    public decimal DailyProfitEstimate { get; set; }
    public decimal AcquisitionCost { get; set; }
}

public class UserFreeUsageDTO
{
    public int BotPlanId { get; set; }
    public int UsageCount { get; set; }
    public DateTime? FirstUsedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public bool IsEligible { get; set; }
}

public class DeployBotRequest
{
    public required string Username { get; set; }
    public int BotPlanId { get; set; }
}

public class DeployBotResponse
{
    public bool Success { get; set; }
    public required string Message { get; set; }
    public int ActivePlanId { get; set; }
    public DateTime ExpiresAt { get; set; }
}
