using TechService.Core.DTOs.Inventory;
using TechService.Core.Entities;
using TechService.Core.Interfaces;

namespace TechService.Infra.Services;

public class InventoryService : IInventoryService
{
    private readonly IInventoryRepository _inventoryRepository;
    private readonly IUnitOfWork _unitOfWork;

    public InventoryService(IInventoryRepository inventoryRepository, IUnitOfWork unitOfWork)
    {
        _inventoryRepository = inventoryRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<List<InventoryItemDto>> GetAllAsync()
    {
        var items = await _inventoryRepository.GetAllAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<InventoryItemDto> GetByIdAsync(int id)
    {
        var item = await _inventoryRepository.GetByIdAsync(id);
        if (item == null)
        {
            throw new KeyNotFoundException($"Repuesto con Id {id} no encontrado.");
        }

        return MapToDto(item);
    }

    public async Task<string> GetNextSkuAsync(string category)
    {
        return await _inventoryRepository.GenerateNextSkuAsync(category);
    }

    public async Task<InventoryItemDto> CreateAsync(CreateInventoryItemDto dto)
    {
        var sku = dto.Sku?.Trim().ToUpper();
        if (string.IsNullOrWhiteSpace(sku))
        {
            sku = await _inventoryRepository.GenerateNextSkuAsync(dto.Category);
        }

        var existing = await _inventoryRepository.GetBySkuAsync(sku);
        if (existing != null)
        {
            throw new InvalidOperationException($"Ya existe un repuesto con el SKU '{sku}'.");
        }

        var item = new InventoryItem
        {
            CodigoSku = sku,
            Nombre = dto.Name.Trim(),
            Categoria = dto.Category.Trim(),
            PrecioCosto = dto.CostPrice,
            PrecioVenta = dto.SalePrice,
            CantidadStock = dto.StockQuantity,
            AlertaStockMinimo = dto.MinStockAlert,
            FechaCreacion = DateTime.UtcNow
        };

        await _inventoryRepository.AddAsync(item);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(item);
    }

    public async Task<InventoryItemDto> UpdateAsync(int id, UpdateInventoryItemDto dto)
    {
        var item = await _inventoryRepository.GetByIdAsync(id);
        if (item == null)
        {
            throw new KeyNotFoundException($"Repuesto con Id {id} no encontrado.");
        }

        item.Nombre = dto.Name.Trim();
        item.Categoria = dto.Category.Trim();
        item.PrecioCosto = dto.CostPrice;
        item.PrecioVenta = dto.SalePrice;
        item.CantidadStock = dto.StockQuantity;
        item.AlertaStockMinimo = dto.MinStockAlert;

        _inventoryRepository.Update(item);
        await _unitOfWork.SaveChangesAsync();

        return MapToDto(item);
    }

    private static InventoryItemDto MapToDto(InventoryItem item)
    {
        return new InventoryItemDto
        {
            Id = item.Id,
            Sku = item.CodigoSku,
            Name = item.Nombre,
            Category = item.Categoria,
            CostPrice = item.PrecioCosto,
            SalePrice = item.PrecioVenta,
            StockQuantity = item.CantidadStock,
            MinStockAlert = item.AlertaStockMinimo,
            CreatedAt = item.FechaCreacion
        };
    }
}
