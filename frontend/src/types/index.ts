export type UserRole = 'Admin' | 'Tech';

export type OrderStatus =
  | 'Recibido'
  | 'En Diagnostico'
  | 'Esperando Repuesto'
  | 'En Reparacion'
  | 'Listo para Entrega'
  | 'Entregado';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: string;
}

export interface Customer {
  id: number;
  documentNumber: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
  isLowStock?: boolean;
  createdAt?: string;
}

export interface CreateInventoryItemRequest {
  sku?: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stockQuantity: number;
  minStockAlert: number;
}

export interface OrderItem {
  id: number;
  inventoryItemId: number;
  sku: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
}

export interface OrderHistory {
  id: number;
  previousStatus?: string;
  newStatus: OrderStatus;
  comment?: string;
  changedByUserId: number;
  changedByUserName: string;
  changedAt: string;
}

export interface ServiceOrderSummary {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  technicianId?: number;
  technicianName?: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  status: OrderStatus;
  laborCost: number;
  totalCost: number;
  createdAt: string;
  completedAt?: string;
}

export interface ServiceOrderDetail {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerDocument: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  technicianId?: number;
  technicianName?: string;
  technicianEmail?: string;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  reportedIssue: string;
  technicalDiagnosis?: string;
  status: OrderStatus;
  laborCost: number;
  totalCost: number;
  createdAt: string;
  completedAt?: string;
  items: OrderItem[];
  history: OrderHistory[];
}

export interface CreateServiceOrderRequest {
  customerId: number;
  technicianId?: number;
  deviceType: string;
  brand: string;
  model: string;
  serialNumber: string;
  reportedIssue: string;
  technicalDiagnosis?: string;
  laborCost: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  comment?: string;
  technicalDiagnosis?: string;
  laborCost?: number;
}

export interface AddOrderItemRequest {
  inventoryItemId: number;
  quantity: number;
}

export interface MonthlyRevenue {
  year: number;
  monthNumber: number;
  periodKey: string;
  monthName: string;
  serviceRevenue: number;
  partsRevenue: number;
  totalRevenue: number;
}

export interface DashboardMetrics {
  activeOrders: number;
  readyForDelivery: number;
  currentMonthRevenue: number;
  lowStockAlertsCount: number;
  monthlyRevenues: MonthlyRevenue[];
  criticalStockItems: InventoryItem[];
}
