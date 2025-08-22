using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;

namespace ProductsDotnetApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        // Construtor padrão para uso em migrations
        public AppDbContext() { }

    // O provider de banco de dados será configurado via DI (Dependency Injection)

    public DbSet<Product> Products { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Department> Departments { get; set; }
    }
}
