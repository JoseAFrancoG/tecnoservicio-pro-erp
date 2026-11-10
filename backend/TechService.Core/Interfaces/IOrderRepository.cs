using TechService.Core.Entities;

namespace TechService.Core.Interfaces;

public interface IOrderRepository
{
    Task<List<ServiceOrder>> GetOrdersAsync(string? status, string? search);
    Task<ServiceOrder?> GetOrderByIdAsync(int id);
    Task<ServiceOrder?> GetOrderWithDetailsAsync(int id);
    Task<string> GenerateNextOrderNumberAsync();
    Task AddOrderAsync(ServiceOrder order);
    Task AddOrderItemAsync(OrderItem item);
    Task AddOrderHistoryAsync(OrderHistory history);
    void UpdateOrder(ServiceOrder order);
}
