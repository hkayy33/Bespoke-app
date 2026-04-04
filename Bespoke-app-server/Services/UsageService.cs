using Microsoft.EntityFrameworkCore;
using BespokeDuaApi.Data;
using BespokeDuaApi.Models;

namespace BespokeDuaApi.Services
{
    public class UsageService
    {
        private readonly BespokeDuaDbContext _context;

        public UsageService(BespokeDuaDbContext context)
        {
            _context = context;
        }

        public async Task IncrementUsageAsync(int userId)
        {
            var now = DateTime.UtcNow;
            var today = now.Date;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var usage = await _context.UserUsages
                .FirstOrDefaultAsync(u => u.UserId == userId && u.Date == today);

            if (usage == null)
            {
                usage = new UserUsage
                {
                    UserId = userId,
                    Date = today,
                    RequestsCount = 1
                };

                _context.UserUsages.Add(usage);
            }
            else
            {
                usage.RequestsCount++;
            }

            user.LastRequestDate = now;

            await _context.SaveChangesAsync();
        }

        public async Task<int> GetDailyUsageAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;

            return await _context.UserUsages
                .Where(u => u.UserId == userId && u.Date == today)
                .Select(u => u.RequestsCount)
                .FirstOrDefaultAsync();
        }

        public async Task<int> GetMonthlyUsageAsync(int userId)
        {
            var today = DateTime.UtcNow.Date;
            var monthStart = new DateTime(today.Year, today.Month, 1);

            return await _context.UserUsages
                .Where(u => u.UserId == userId && u.Date >= monthStart && u.Date <= today)
                .SumAsync(u => (int?)u.RequestsCount) ?? 0;
        }
    }
}