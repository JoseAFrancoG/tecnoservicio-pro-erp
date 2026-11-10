using System.Data;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using TechService.Core.DTOs.Dashboard;
using TechService.Core.Interfaces;
using TechService.Infra.Data;

namespace TechService.Infra.Repositories;

public class DashboardRepository : IDashboardRepository
{
    private readonly TechServiceDbContext _context;

    public DashboardRepository(TechServiceDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
    {
        var result = new DashboardMetricsDto();
        var connection = _context.Database.GetDbConnection();

        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync();
        }

        await using var command = connection.CreateCommand();
        command.CommandText = "dbo.sp_GetDashboardMetrics";
        command.CommandType = CommandType.StoredProcedure;

        await using var reader = await command.ExecuteReaderAsync();

        // --------------------------------------------------------------------
        // Result Set 1: KPIs Escalares
        // --------------------------------------------------------------------
        if (await reader.ReadAsync())
        {
            result.ActiveOrders = reader.GetInt32(reader.GetOrdinal("ActiveOrders"));
            result.ReadyForDelivery = reader.GetInt32(reader.GetOrdinal("ReadyForDelivery"));
            result.CurrentMonthRevenue = reader.GetDecimal(reader.GetOrdinal("CurrentMonthRevenue"));
            result.LowStockAlertsCount = reader.GetInt32(reader.GetOrdinal("LowStockAlertsCount"));
        }

        // --------------------------------------------------------------------
        // Result Set 2: Histórico últimos 6 meses (Servicios vs Repuestos)
        // --------------------------------------------------------------------
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                result.MonthlyRevenues.Add(new MonthlyRevenueDto
                {
                    Year = reader.GetInt32(reader.GetOrdinal("Year")),
                    MonthNumber = reader.GetInt32(reader.GetOrdinal("MonthNumber")),
                    PeriodKey = reader.GetString(reader.GetOrdinal("PeriodKey")),
                    MonthName = reader.GetString(reader.GetOrdinal("MonthName")),
                    ServiceRevenue = reader.GetDecimal(reader.GetOrdinal("ServiceRevenue")),
                    PartsRevenue = reader.GetDecimal(reader.GetOrdinal("PartsRevenue")),
                    TotalRevenue = reader.GetDecimal(reader.GetOrdinal("TotalRevenue"))
                });
            }
        }

        // --------------------------------------------------------------------
        // Result Set 3: Lista de Ítems con Stock Crítico
        // --------------------------------------------------------------------
        if (await reader.NextResultAsync())
        {
            while (await reader.ReadAsync())
            {
                result.CriticalStockItems.Add(new LowStockItemDto
                {
                    Id = reader.GetInt32(reader.GetOrdinal("Id")),
                    Sku = reader.GetString(reader.GetOrdinal("Sku")),
                    Name = reader.GetString(reader.GetOrdinal("Name")),
                    Category = reader.GetString(reader.GetOrdinal("Category")),
                    CostPrice = reader.GetDecimal(reader.GetOrdinal("CostPrice")),
                    SalePrice = reader.GetDecimal(reader.GetOrdinal("SalePrice")),
                    StockQuantity = reader.GetInt32(reader.GetOrdinal("StockQuantity")),
                    MinStockAlert = reader.GetInt32(reader.GetOrdinal("MinStockAlert"))
                });
            }
        }

        return result;
    }
}
