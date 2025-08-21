using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;

namespace ProductsDotnetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Construtor padrão para uso em migrations
        public AppDbContext() { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                // String de conexão padrão para design-time (PostgreSQL)
                optionsBuilder.UseNpgsql("Host=db;Port=5432;Database=products;Username=postgres;Password=postgres");
            }
        }

    public DbSet<Product> Products { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    }
}
