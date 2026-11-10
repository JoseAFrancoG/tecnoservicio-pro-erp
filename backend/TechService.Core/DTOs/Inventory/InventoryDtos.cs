using System.ComponentModel.DataAnnotations;

namespace TechService.Core.DTOs.Inventory;

public class InventoryItemDto
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockAlert { get; set; }
    public bool IsLowStock => StockQuantity <= MinStockAlert;
    public DateTime CreatedAt { get; set; }
}

public class CreateInventoryItemDto
{
    [MaxLength(50)]
    public string? Sku { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0, 999999)]
    public decimal CostPrice { get; set; }

    [Required]
    [Range(0, 999999)]
    public decimal SalePrice { get; set; }

    [Required]
    [Range(0, 100000)]
    public int StockQuantity { get; set; }

    [Required]
    [Range(0, 10000)]
    public int MinStockAlert { get; set; } = 5;
}

public class UpdateInventoryItemDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0, 999999)]
    public decimal CostPrice { get; set; }

    [Required]
    [Range(0, 999999)]
    public decimal SalePrice { get; set; }

    [Required]
    [Range(0, 100000)]
    public int StockQuantity { get; set; }

    [Required]
    [Range(0, 10000)]
    public int MinStockAlert { get; set; }
}
