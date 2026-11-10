using TechService.Core.DTOs.Dashboard;
using TechService.Core.Interfaces;

namespace TechService.Infra.Services;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _dashboardRepository;

    public DashboardService(IDashboardRepository dashboardRepository)
    {
        _dashboardRepository = dashboardRepository;
    }

    public async Task<DashboardMetricsDto> GetDashboardMetricsAsync()
    {
        return await _dashboardRepository.GetDashboardMetricsAsync();
    }
}
