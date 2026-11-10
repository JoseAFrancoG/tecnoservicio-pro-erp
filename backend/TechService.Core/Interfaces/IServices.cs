using TechService.Core.DTOs.Auth;
using TechService.Core.DTOs.Dashboard;
using TechService.Core.DTOs.Inventory;
using TechService.Core.DTOs.Orders;
using TechService.Core.Entities;

namespace TechService.Core.Interfaces;

public interface ITokenService
{
    string GenerateJwtToken(User user);
}

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
}

public interface IOrderService
{
    Task<List<ServiceOrderSummaryDto>> GetOrdersAsync(string? status, string? search);
    Task<ServiceOrderDetailDto> GetOrderByIdAsync(int id);
    Task<ServiceOrderDetailDto> CreateOrderAsync(CreateServiceOrderDto dto, int currentUserId);
    Task<ServiceOrderDetailDto> UpdateOrderStatusAsync(int orderId, UpdateOrderStatusDto dto, int currentUserId);
    Task<ServiceOrderDetailDto> AddOrderItemAsync(int orderId, AddOrderItemDto dto, int currentUserId);
    Task<List<OrderImageDto>> GetOrderImagesAsync(int orderId);
    Task<OrderImageDto> AddOrderImageAsync(int orderId, UploadOrderImageDto dto, int currentUserId);
    Task DeleteOrderImageAsync(int orderId, int imageId, int currentUserId);
}

public interface IInventoryService
{
    Task<List<InventoryItemDto>> GetAllAsync();
    Task<InventoryItemDto> GetByIdAsync(int id);
    Task<string> GetNextSkuAsync(string category);
    Task<InventoryItemDto> CreateAsync(CreateInventoryItemDto dto);
    Task<InventoryItemDto> UpdateAsync(int id, UpdateInventoryItemDto dto);
}

public interface IDashboardService
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync();
}
