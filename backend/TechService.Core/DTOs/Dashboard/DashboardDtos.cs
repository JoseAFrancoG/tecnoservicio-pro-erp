namespace TechService.Core.DTOs.Dashboard;

public class DashboardMetricsDto
{
    public int ActiveOrders { get; set; }
    public int ReadyForDelivery { get; set; }
    public decimal CurrentMonthRevenue { get; set; }
    public int LowStockAlertsCount { get; set; }
    public List<MonthlyRevenueDto> MonthlyRevenues { get; set; } = new();
    public List<LowStockItemDto> CriticalStockItems { get; set; } = new();
}

public class MonthlyRevenueDto
{
    public int Year { get; set; }
    public int MonthNumber { get; set; }
    public string PeriodKey { get; set; } = string.Empty;
    public string MonthName { get; set; } = string.Empty;
    public decimal ServiceRevenue { get; set; }
    public decimal PartsRevenue { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class LowStockItemDto
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal CostPrice { get; set; }
    public decimal SalePrice { get; set; }
    public int StockQuantity { get; set; }
    public int MinStockAlert { get; set; }
}
