using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Meta.Application;

namespace Meta_xi.Application;

[ApiController]
[Route("api/[controller]")]
public class DailyClaimController : ControllerBase
{
    private readonly DBContext _context;
    private const float DAILY_BONUS_AMOUNT = 140f;

    public DailyClaimController(DBContext context)
    {
        _context = context;
    }

    // ── DTOs ───────────────────────────────────────────────────────────

    public class ClaimRequestDTO
    {
        public string Email { get; set; } = string.Empty;
    }

    public class DailyClaimStatusDTO
    {
        public bool ClaimedToday { get; set; }
        public int Streak { get; set; }
        public int TotalDays { get; set; }
        public float TotalEarned { get; set; }
        public string NextClaimTime { get; set; } = string.Empty;
        public List<DayStatusDTO> CalendarDays { get; set; } = new();
    }

    public class DayStatusDTO
    {
        public int Day { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public string Status { get; set; } = "future"; // "checked", "missed", "current", "future"
    }

    // ── GET: api/DailyClaim/status/{username} ──────────────────────────
    [HttpGet("status/{username}")]
    public async Task<IActionResult> GetStatus(string username)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == username || u.PhoneNumber == username);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        var email = user.Email!;

        // Get all claims for this user (order in memory - SQLite doesn't support DateTimeOffset in ORDER BY)
        var allClaims = await _context.DailyClaims
            .Where(dc => dc.Email == email)
            .ToListAsync();
        allClaims = allClaims.OrderBy(dc => dc.ClaimedAt).ToList();

        // Check if claimed today
        var today = DateTimeOffset.UtcNow.Date;
        var claimedToday = allClaims.Any(dc => dc.ClaimedAt.UtcDateTime.Date == today);

        // Calculate streak: count consecutive days ending at today (or yesterday if not claimed today)
        int streak = 0;
        var claimDates = allClaims.Select(dc => dc.ClaimedAt.UtcDateTime.Date).Distinct().OrderByDescending(d => d).ToList();

        if (claimDates.Count > 0)
        {
            var checkDate = claimedToday ? today : today.AddDays(-1);
            if (claimDates.Contains(checkDate))
            {
                streak = 1;
                checkDate = checkDate.AddDays(-1);
                while (claimDates.Contains(checkDate))
                {
                    streak++;
                    checkDate = checkDate.AddDays(-1);
                }
            }
        }

        // Total unique days claimed
        var totalDays = claimDates.Count;

        // Total earned
        var totalEarned = allClaims.Sum(dc => dc.Amount);

        // Calculate next claim time (24h from last claim)
        string nextClaimTime = "";
        if (claimedToday && allClaims.Count > 0)
        {
            var lastClaim = allClaims.Max(dc => dc.ClaimedAt);
            var nextAvailable = lastClaim.AddHours(24);
            var remaining = nextAvailable - DateTimeOffset.UtcNow;
            if (remaining.TotalSeconds > 0)
            {
                var h = (int)remaining.TotalHours;
                var m = remaining.Minutes;
                var s = remaining.Seconds;
                nextClaimTime = $"{h:D2}:{m:D2}:{s:D2}";
            }
            else
            {
                nextClaimTime = "00:00:00";
            }
        }

        // Build calendar data for current month (and previous months up to first claim)
        var calendarDays = BuildCalendarDays(claimDates, today);

        var response = new DailyClaimStatusDTO
        {
            ClaimedToday = claimedToday,
            Streak = streak,
            TotalDays = totalDays,
            TotalEarned = totalEarned,
            NextClaimTime = nextClaimTime,
            CalendarDays = calendarDays
        };

        return Ok(response);
    }

    // ── POST: api/DailyClaim/claim ─────────────────────────────────────
    [HttpPost("claim")]
    public async Task<IActionResult> Claim([FromBody] ClaimRequestDTO request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email || u.PhoneNumber == request.Email);
        if (user == null)
        {
            return NotFound(new { message = "Usuario no encontrado" });
        }

        var email = user.Email!;

        // Check if already claimed today (load to memory first - SQLite can't translate DateTimeOffset.Date)
        var today = DateTimeOffset.UtcNow.Date;
        var todayClaims = await _context.DailyClaims
            .Where(dc => dc.Email == email)
            .ToListAsync();
        var alreadyClaimed = todayClaims.Any(dc => dc.ClaimedAt.UtcDateTime.Date == today);

        if (alreadyClaimed)
        {
            return Conflict(new { message = "Ya reclamaste tu bono diario hoy" });
        }

        // Find wallet
        var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.Email == email);
        if (wallet == null)
        {
            return NotFound(new { message = "Cartera no encontrada" });
        }

        // Credit 140 COP to wallet
        wallet.Balance += DAILY_BONUS_AMOUNT;
        _context.Entry(wallet).State = EntityState.Modified;

        // Create claim record
        var claim = new DailyClaim
        {
            UserId = user.Id,
            Email = email,
            Amount = DAILY_BONUS_AMOUNT,
            ClaimedAt = DateTimeOffset.UtcNow
        };

        _context.DailyClaims.Add(claim);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Bono diario reclamado exitosamente",
            amount = DAILY_BONUS_AMOUNT,
            newBalance = wallet.Balance
        });
    }

    // ── Helper: Build Calendar Days ────────────────────────────────────
    private List<DayStatusDTO> BuildCalendarDays(List<DateTime> claimDates, DateTime today)
    {
        var days = new List<DayStatusDTO>();

        // Show current month
        var currentMonth = today.Month;
        var currentYear = today.Year;

        var firstDayOfMonth = new DateTime(currentYear, currentMonth, 1);
        var daysInMonth = DateTime.DaysInMonth(currentYear, currentMonth);

        for (int d = 1; d <= daysInMonth; d++)
        {
            var date = new DateTime(currentYear, currentMonth, d);
            var dayStatus = new DayStatusDTO
            {
                Day = d,
                Month = currentMonth,
                Year = currentYear
            };

            if (date.Date == today)
            {
                if (claimDates.Contains(today))
                {
                    dayStatus.Status = "checked";
                }
                else
                {
                    dayStatus.Status = "current";
                }
            }
            else if (date < today)
            {
                // Past days: checked if claimed, missed if not
                if (claimDates.Contains(date))
                {
                    dayStatus.Status = "checked";
                }
                else
                {
                    dayStatus.Status = "missed";
                }
            }
            else
            {
                dayStatus.Status = "future";
            }

            days.Add(dayStatus);
        }

        return days;
    }
}