using Microsoft.EntityFrameworkCore;
using TechService.Core.Entities;
using TechService.Core.Interfaces;
using TechService.Infra.Data;

namespace TechService.Infra.Repositories;

public class UserRepository : IUserRepository
{
    private readonly TechServiceDbContext _context;

    public UserRepository(TechServiceDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.CorreoElectronico.ToLower() == email.Trim().ToLower());
    }

    public async Task<List<User>> GetAllTechniciansAsync()
    {
        return await _context.Users
            .AsNoTracking()
            .Where(u => u.Activo && (u.Rol == "Tech" || u.Rol == "Admin"))
            .OrderBy(u => u.NombreCompleto)
            .ToListAsync();
    }
}
