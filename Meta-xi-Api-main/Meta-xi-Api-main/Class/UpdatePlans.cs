using Microsoft.EntityFrameworkCore;

namespace Meta_xi.Application;

public class UpdatePlans : IUpdatePlansPerHour
{
    public readonly DBContext context;

    public UpdatePlans(DBContext dbcontext)
    {
        context = dbcontext;
    }

    public async Task UpdatePlansPerHour()
    {
        DateTime dateTime = DateTime.Now;
        var userplans = await context.UserActivePlans.Where(p => p.LastTradeAt==null || p.LastTradeAt < p.ExpiresAt).ToListAsync();


        foreach (var userPlan in userplans)
        {
            var plan = await context.BotPlans.FindAsync(userPlan.BotPlanId);

            if (plan == null) continue;

            double earnPerSecond = (double)plan.DailyProfitEstimate / (3600 * 24);

            double totalEarned = dateTime.Subtract(userPlan.LastTradeAt).TotalSeconds * earnPerSecond;

           
            userPlan.AccumulatedProfit += (decimal)totalEarned;
            userPlan.LastTradeAt = dateTime;

            context.Entry(userPlan).State = EntityState.Modified;
           
            var wallet = await context.Wallets.FirstOrDefaultAsync(option => option.Email == userPlan.Username);
            if (wallet != null)
            {
                wallet.Balance += (float)totalEarned;

                context.Entry(wallet).State = EntityState.Modified;
             
            }
            await context.SaveChangesAsync();


        }

    }

    private async Task AddNewPlan(UserPlans userPlan, Plan plan, double benefitPerHour)
    {
        var newUpdatePlan = new UpdatePlansForUser
        {
            Username = userPlan.Username,
            AcumulatedBenefitperHour = benefitPerHour,
            AcumulatedTotalBenefit = benefitPerHour
        };

        await context.UpdatePlansForUser.AddAsync(newUpdatePlan);
        await context.SaveChangesAsync();

        Console.WriteLine($"Nuevo UpdatePlansForUser creado para {userPlan.Username} con beneficio por hora: {benefitPerHour}");

        await UpdateUserPlan(userPlan, plan, benefitPerHour);
    }

    private async Task UpdateExistingPlan(
        UserPlans userPlan,
        Plan plan,
        double benefitPerHour,
        List<UserBenefitDaily> userBenefitDailies,
        UpdatePlansForUser existingUpdatePlan)
    {
        var userBenefitDaily = userBenefitDailies.FirstOrDefault(option => option.Username == userPlan.Username);

        if (userBenefitDaily != null && existingUpdatePlan.AcumulatedBenefitperHour < userBenefitDaily.AcumulatedBenefitperDay)
        {
            existingUpdatePlan.AcumulatedBenefitperHour =
                Math.Round(existingUpdatePlan.AcumulatedBenefitperHour + benefitPerHour, 2);
            existingUpdatePlan.AcumulatedTotalBenefit =
                Math.Round(existingUpdatePlan.AcumulatedTotalBenefit + benefitPerHour, 2);

            Console.WriteLine($"AcumulatedBenefitperHour : {existingUpdatePlan.AcumulatedBenefitperHour} y AcumulatedTotalBenefit : {existingUpdatePlan.AcumulatedTotalBenefit} actualizados para {userPlan.Username}");
        }
        else
        {
            existingUpdatePlan.AcumulatedBenefitperHour =
                Math.Round(benefitPerHour, 2);
            existingUpdatePlan.AcumulatedTotalBenefit =
                Math.Round(existingUpdatePlan.AcumulatedTotalBenefit + benefitPerHour, 2);

            Console.WriteLine($"AcumulatedBenefitperHour restablecido para {userPlan.Username}: {existingUpdatePlan.AcumulatedBenefitperHour}");
        }
        context.Entry(existingUpdatePlan).State = EntityState.Modified;
        await context.SaveChangesAsync();

        await UpdateUserPlan(userPlan, plan, benefitPerHour);
    }

    private async Task UpdateUserPlan(UserPlans userPlan, Plan plan, double benefitPerHour)
    {
        userPlan.Percentage = Math.Round(userPlan.Percentage + benefitPerHour / plan.TotalBenefit * 100, 2);

        context.Entry(userPlan).State = EntityState.Modified;
        await context.SaveChangesAsync();

        Console.WriteLine($"Porcentaje actualizado para {userPlan.Username}: {userPlan.Percentage}");

        var wallet = await context.Wallets.FirstOrDefaultAsync(option => option.Email == userPlan.Username);
        if (wallet != null)
        {
            wallet.Balance += (float)benefitPerHour;

            context.Entry(wallet).State = EntityState.Modified;
            await context.SaveChangesAsync();

            Console.WriteLine($"Balance de wallet actualizado para {userPlan.Username}: {wallet.Balance}");
        }
    }
}



