using System.ComponentModel.DataAnnotations;

namespace TechService.Core.DTOs.Orders;

public class CreateServiceOrderDto
{
    [Required]
    public int CustomerId { get; set; }

    public int? TechnicianId { get; set; }

    [Required]
    [MaxLength(100)]
    public string DeviceType { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Brand { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Model { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    [Required]
    public string ReportedIssue { get; set; } = string.Empty;

    public string? TechnicalDiagnosis { get; set; }

    [Range(0, 999999)]
    public decimal LaborCost { get; set; } = 0.00m;
}

public class UpdateOrderStatusDto
{
    [Required]
    public string Status { get; set; } = string.Empty;

    public string? Comment { get; set; }

    public string? TechnicalDiagnosis { get; set; }

    public decimal? LaborCost { get; set; }
}

public class AddOrderItemDto
{
    [Required]
    public int InventoryItemId { get; set; }

    [Required]
    [Range(1, 1000)]
    public int Quantity { get; set; }
}

public class ServiceOrderSummaryDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public int? TechnicianId { get; set; }
    public string? TechnicianName { get; set; }
    public string DeviceType { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal LaborCost { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class ServiceOrderDetailDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerDocument { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public int? TechnicianId { get; set; }
    public string? TechnicianName { get; set; }
    public string? TechnicianEmail { get; set; }
    public string DeviceType { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string SerialNumber { get; set; } = string.Empty;
    public string ReportedIssue { get; set; } = string.Empty;
    public string? TechnicalDiagnosis { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal LaborCost { get; set; }
    public decimal TotalCost { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
    public List<OrderHistoryDto> History { get; set; } = new();
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int InventoryItemId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ItemName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class OrderHistoryDto
{
    public int Id { get; set; }
    public string? PreviousStatus { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string? Comment { get; set; }
    public int ChangedByUserId { get; set; }
    public string ChangedByUserName { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
}
