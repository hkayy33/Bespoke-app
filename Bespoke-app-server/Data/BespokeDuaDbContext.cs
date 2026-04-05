using BespokeDuaApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BespokeDuaApi.Data
{
    public class BespokeDuaDbContext : DbContext
    {
        public BespokeDuaDbContext(DbContextOptions<BespokeDuaDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<SavedDua> SavedDuas { get; set; } = null!;
        public DbSet<UserUsage> UserUsages { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId);

                entity.Property(e => e.Username)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(255);

                entity.Property(e => e.HashedPassword)
                      .IsRequired();

                entity.Property(e => e.Plan)
                      .IsRequired()
                      .HasConversion<string>();

                entity.Property(e => e.CreatedAt)
                      .IsRequired();

                entity.HasIndex(e => e.Username)
                      .IsUnique();

                entity.HasIndex(e => e.Email)
                      .IsUnique();

                entity.HasMany(e => e.SavedDuas)
                      .WithOne(d => d.User)
                      .HasForeignKey(d => d.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<SavedDua>(entity =>
            {
                entity.HasKey(e => e.DuaId);

                entity.Property(e => e.DuaId)
                      .ValueGeneratedNever();

                entity.Property(e => e.Dua)
                      .IsRequired();

                entity.Property(e => e.CreatedAt)
                      .IsRequired();
            });

            modelBuilder.Entity<UserUsage>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Date)
                      .IsRequired()
                      .HasColumnType("date");

                entity.Property(e => e.RequestsCount)
                      .IsRequired();

                entity.HasIndex(e => new { e.UserId, e.Date })
                      .IsUnique();
            });
        }
    }
}