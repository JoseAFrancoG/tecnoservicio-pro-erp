import { apiClient } from './client';
import { InventoryItem, CreateInventoryItemRequest } from '../types';

export const inventoryApi = {
  getInventory: async (): Promise<InventoryItem[]> => {
    const response = await apiClient.get<InventoryItem[]>('/inventory');
    return response.data;
  },

  getNextSku: async (category?: string): Promise<{ sku: string }> => {
    const response = await apiClient.get<{ sku: string }>('/inventory/next-sku', {
      params: { category: category || 'Almacenamiento' },
    });
    return response.data;
  },

  createItem: async (data: CreateInventoryItemRequest): Promise<InventoryItem> => {
    const response = await apiClient.post<InventoryItem>('/inventory', data);
    return response.data;
  },
};
