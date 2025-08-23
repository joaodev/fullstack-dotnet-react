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
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var bytes = System.Text.Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public static bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }
    }

    public class UserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await _context.Users.ToListAsync();
        }

            public async Task<int> TotalAsync()
            {
                return await _context.Users.CountAsync(u => u.Status);
            }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        private readonly IUserFactory _userFactory = new UserFactory();

        public async Task AddAsync(string name, string email, string password)
        {
            var passwordHash = PasswordHelper.HashPassword(password);
            var user = _userFactory.Create(name, email, passwordHash);
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            user.PasswordHash = PasswordHelper.HashPassword(user.PasswordHash);
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }

        public async Task SoftDeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                user.Status = false;
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}
