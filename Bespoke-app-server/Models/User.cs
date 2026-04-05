namespace BespokeDuaApi.Models
{
    public class User
    {
        public int UserId { get; set; }                  // PK
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string HashedPassword { get; set; } = string.Empty;
        public PlanType Plan { get; set; } = PlanType.Free;
        public int DailyRequests { get; set; }
        public int MonthlyRequests { get; set; }
        public DateTime? LastRequestDate { get; set; }
        public DateTime CreatedAt { get; set; }

        public ICollection<SavedDua> SavedDuas { get; set; } = new List<SavedDua>();
    }
}