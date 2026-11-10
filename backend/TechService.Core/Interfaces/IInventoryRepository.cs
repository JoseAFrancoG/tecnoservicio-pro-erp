using TechService.Core.Entities;

namespace TechService.Core.Interfaces;

public interface IInventoryRepository
{
    Task<List<InventoryItem>> GetAllAsync();
    Task<InventoryItem?> GetByIdAsync(int id);
    Task<InventoryItem?> GetBySkuAsync(string sku);
    Task<string> GenerateNextSkuAsync(string category);
    Task<List<InventoryItem>> GetLowStockItemsAsync();
    Task AddAsync(InventoryItem item);
    void Update(InventoryItem item);
}
