using TechService.Core.DTOs.Dashboard;

namespace TechService.Core.Interfaces;

public interface IDashboardRepository
{
    Task<DashboardMetricsDto> GetDashboardMetricsAsync();
}
