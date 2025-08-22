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
    public class DepartmentRepository
    {
        private readonly AppDbContext _context;

        public DepartmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Departments.ToListAsync();
        }

        private readonly IDepartmentFactory _departmentFactory = new DepartmentFactory();

        public async Task AddAsync(string name)
        {
            var department = _departmentFactory.Create(name);
            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
        }

        public async Task SoftDeleteAsync(int id)
        {
            var department = await _context.Departments.FindAsync(id);
            if (department != null)
            {
                department.Status = false;
                _context.Departments.Update(department);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Department?> GetByIdAsync(int id)
        {
            return await _context.Departments.FirstOrDefaultAsync(d => d.Id == id && d.Status);
        }
    }
}
