using Microsoft.EntityFrameworkCore;
using TechService.Core.Entities;
using TechService.Core.Interfaces;
using TechService.Infra.Data;

namespace TechService.Infra.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly TechServiceDbContext _context;

    public OrderRepository(TechServiceDbContext context)
    {
        _context = context;
    }

    public async Task<List<ServiceOrder>> GetOrdersAsync(string? status, string? search)
    {
        var query = _context.ServiceOrders
            .AsNoTracking()
            .Include(o => o.Cliente)
            .Include(o => o.Tecnico)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status.Trim() != "Todos")
        {
            var trimmedStatus = status.Trim();
            query = query.Where(o => o.Estado.ToLower() == trimmedStatus.ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(o =>
                o.NumeroOrden.ToLower().Contains(s) ||
                o.NumeroSerie.ToLower().Contains(s) ||
                o.Cliente.NombreCompleto.ToLower().Contains(s) ||
                o.Cliente.NumeroDocumento.ToLower().Contains(s) ||
                o.Marca.ToLower().Contains(s) ||
                o.Modelo.ToLower().Contains(s));
        }

        return await query.OrderByDescending(o => o.FechaCreacion).ToListAsync();
    }

    public async Task<ServiceOrder?> GetOrderByIdAsync(int id)
    {
        return await _context.ServiceOrders
            .Include(o => o.ItemsOrden)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<ServiceOrder?> GetOrderWithDetailsAsync(int id)
    {
        return await _context.ServiceOrders
            .AsNoTracking()
            .Include(o => o.Cliente)
            .Include(o => o.Tecnico)
            .Include(o => o.ItemsOrden)
                .ThenInclude(oi => oi.InventarioItem)
            .Include(o => o.HistorialOrden.OrderByDescending(h => h.FechaModificacion))
                .ThenInclude(h => h.UsuarioModifico)
            .Include(o => o.EvidenciasFotograficas.OrderByDescending(img => img.FechaCreacion))
                .ThenInclude(img => img.SubidoPorUsuario)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<string> GenerateNextOrderNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"ORD-{year}-";

        var lastOrder = await _context.ServiceOrders
            .AsNoTracking()
            .Where(o => o.NumeroOrden.StartsWith(prefix))
            .OrderByDescending(o => o.NumeroOrden)
            .Select(o => o.NumeroOrden)
            .FirstOrDefaultAsync();

        var nextConsecutive = 1;
        if (!string.IsNullOrEmpty(lastOrder) && lastOrder.Length >= 13)
        {
            var numericPart = lastOrder.Substring(prefix.Length);
            if (int.TryParse(numericPart, out int currentNumber))
            {
                nextConsecutive = currentNumber + 1;
            }
        }

        return $"{prefix}{nextConsecutive:D4}";
    }

    public async Task AddOrderAsync(ServiceOrder order)
    {
        await _context.ServiceOrders.AddAsync(order);
    }

    public async Task AddOrderItemAsync(OrderItem item)
    {
        await _context.OrderItems.AddAsync(item);
    }

    public async Task AddOrderHistoryAsync(OrderHistory history)
    {
        await _context.OrderHistories.AddAsync(history);
    }

    public async Task<List<OrderImage>> GetOrderImagesAsync(int orderId)
    {
        return await _context.EvidenciasFotograficas
            .AsNoTracking()
            .Include(img => img.SubidoPorUsuario)
            .Where(img => img.OrdenServicioId == orderId)
            .OrderByDescending(img => img.FechaCreacion)
            .ToListAsync();
    }

    public async Task<OrderImage?> GetOrderImageByIdAsync(int imageId)
    {
        return await _context.EvidenciasFotograficas
            .Include(img => img.SubidoPorUsuario)
            .FirstOrDefaultAsync(img => img.Id == imageId);
    }

    public async Task AddOrderImageAsync(OrderImage image)
    {
        await _context.EvidenciasFotograficas.AddAsync(image);
    }

    public void DeleteOrderImage(OrderImage image)
    {
        _context.EvidenciasFotograficas.Remove(image);
    }

    public void UpdateOrder(ServiceOrder order)
    {
        _context.ServiceOrders.Update(order);
    }
}
