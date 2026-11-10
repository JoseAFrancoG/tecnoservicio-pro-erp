import { apiClient } from './client';
import { DashboardMetrics } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardMetrics> => {
    const response = await apiClient.get<DashboardMetrics>('/dashboard/summary');
    return response.data;
  },
};
