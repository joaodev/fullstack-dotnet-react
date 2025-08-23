using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProductsDotnetApi.Models;
using ProductsDotnetApi.Data;
using Backend.Factories;
using Backend.Interfaces;

namespace ProductsDotnetApi.Repositories
{
    public class ProductRepository
    {
        private readonly AppDbContext _context;

        public ProductRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            return await _context.Products.Where(p => p.Status).ToListAsync();
        }

            public async Task<int> TotalAsync()
            {
                return await _context.Products.CountAsync(p => p.Status);
            }

        public async Task<Product?> GetByIdAsync(Guid id)
        {
            return await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.Status);
        }

        private readonly IProductFactory _productFactory = new ProductFactory();

        public async Task AddAsync(string code, string description, int departmentId, decimal price, bool status)
        {
            var product = _productFactory.Create(code, description, departmentId, price, status);
            _context.Products.Add(product);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Product product)
        {
            _context.Products.Update(product);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> ExistsByCodeOrDescriptionAsync(string code, string description)
        {
            return await _context.Products.AnyAsync(p => p.Code == code || p.Description == description);
        }

        public async Task SoftDeleteAsync(Guid id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product != null)
            {
                product.Status = false;
                _context.Products.Update(product);
                await _context.SaveChangesAsync();
            }
        }
    }
}
