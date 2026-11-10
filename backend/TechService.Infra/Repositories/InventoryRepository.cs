using Microsoft.EntityFrameworkCore;
using TechService.Core.Entities;
using TechService.Core.Interfaces;
using TechService.Infra.Data;

namespace TechService.Infra.Repositories;

public class InventoryRepository : IInventoryRepository
{
    private readonly TechServiceDbContext _context;

    public InventoryRepository(TechServiceDbContext context)
    {
        _context = context;
    }

    public async Task<List<InventoryItem>> GetAllAsync()
    {
        return await _context.InventoryItems
            .AsNoTracking()
            .OrderBy(i => i.Nombre)
            .ToListAsync();
    }

    public async Task<InventoryItem?> GetByIdAsync(int id)
    {
        return await _context.InventoryItems.FirstOrDefaultAsync(i => i.Id == id);
    }

    public async Task<InventoryItem?> GetBySkuAsync(string sku)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.CodigoSku.ToLower() == sku.Trim().ToLower());
    }

    public async Task<string> GenerateNextSkuAsync(string category)
    {
        var prefix = category.Trim().ToLower() switch
        {
            var c when c.Contains("almacen") || c.Contains("ssd") || c.Contains("disco") => "ALM",
            var c when c.Contains("ram") || c.Contains("memoria") => "RAM",
            var c when c.Contains("pantalla") || c.Contains("display") => "DISP",
            var c when c.Contains("bater") => "BAT",
            var c when c.Contains("refrig") || c.Contains("fan") || c.Contains("ventilador") => "REF",
            var c when c.Contains("consum") || c.Contains("pasta") || c.Contains("termic") => "CON",
            var c when c.Contains("cargador") || c.Contains("fuente") => "CAR",
            var c when c.Contains("accesorio") => "ACC",
            _ => category.Length >= 3 ? category[..3].ToUpper() : "GEN"
        };

        var searchPrefix = $"REP-{prefix}-";
        var existingCount = await _context.InventoryItems
            .CountAsync(i => i.CodigoSku.StartsWith(searchPrefix));

        var nextNumber = existingCount + 1;
        var candidate = $"{searchPrefix}{nextNumber:D4}";

        // Asegurar que no exista colisión
        while (await _context.InventoryItems.AnyAsync(i => i.CodigoSku == candidate))
        {
            nextNumber++;
            candidate = $"{searchPrefix}{nextNumber:D4}";
        }

        return candidate;
    }

    public async Task<List<InventoryItem>> GetLowStockItemsAsync()
    {
        return await _context.InventoryItems
            .AsNoTracking()
            .Where(i => i.CantidadStock <= i.AlertaStockMinimo)
            .OrderBy(i => i.CantidadStock)
            .ToListAsync();
    }

    public async Task AddAsync(InventoryItem item)
    {
        await _context.InventoryItems.AddAsync(item);
    }

    public void Update(InventoryItem item)
    {
        _context.InventoryItems.Update(item);
    }
}
