import { apiClient } from './client';
import {
  ServiceOrderSummary,
  ServiceOrderDetail,
  CreateServiceOrderRequest,
  UpdateOrderStatusRequest,
  AddOrderItemRequest,
  OrderImage,
  UploadOrderImageRequest,
} from '../types';

export const ordersApi = {
  getOrders: async (status?: string, search?: string): Promise<ServiceOrderSummary[]> => {
    const params: Record<string, string> = {};
    if (status && status !== 'Todos') params.status = status;
    if (search && search.trim()) params.search = search.trim();

    const response = await apiClient.get<ServiceOrderSummary[]>('/orders', { params });
    return response.data;
  },

  getOrderById: async (id: number): Promise<ServiceOrderDetail> => {
    const response = await apiClient.get<ServiceOrderDetail>(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (data: CreateServiceOrderRequest): Promise<ServiceOrderDetail> => {
    const response = await apiClient.post<ServiceOrderDetail>('/orders', data);
    return response.data;
  },

  updateStatus: async (id: number, data: UpdateOrderStatusRequest): Promise<ServiceOrderDetail> => {
    const response = await apiClient.patch<ServiceOrderDetail>(`/orders/${id}/status`, data);
    return response.data;
  },

  addItem: async (id: number, data: AddOrderItemRequest): Promise<ServiceOrderDetail> => {
    const response = await apiClient.post<ServiceOrderDetail>(`/orders/${id}/items`, data);
    return response.data;
  },

  getImages: async (orderId: number): Promise<OrderImage[]> => {
    const response = await apiClient.get<OrderImage[]>(`/orders/${orderId}/images`);
    return response.data;
  },

  uploadImage: async (orderId: number, data: UploadOrderImageRequest): Promise<OrderImage> => {
    const response = await apiClient.post<OrderImage>(`/orders/${orderId}/images`, data);
    return response.data;
  },

  deleteImage: async (orderId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/orders/${orderId}/images/${imageId}`);
  },
};
