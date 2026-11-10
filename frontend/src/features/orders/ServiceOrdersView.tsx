import React, { useState, useEffect, useCallback } from 'react';
import { ordersApi } from '../../api/ordersApi';
import { inventoryApi } from '../../api/inventoryApi';
import {
  ServiceOrderSummary,
  ServiceOrderDetail,
  OrderStatus,
  InventoryItem,
  CreateServiceOrderRequest,
  UpdateOrderStatusRequest,
  AddOrderItemRequest,
} from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  Eye,
  Laptop,
  User,
  Calendar,
  AlertCircle,
  PlusCircle,
  Clock,
  History,
  CheckCircle,
  Phone,
  FileText,
  DollarSign,
  Package,
  Printer,
  FileDown,
  ScanLine,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { generateOrderPdf } from '../../utils/generateOrderPdf';
import { BarcodeScannerModal } from '../../components/barcode/BarcodeScannerModal';
import { OrderPhotoGallery } from '../../components/orders/OrderPhotoGallery';

const STATUS_LIST: (OrderStatus | 'Todos')[] = [
  'Todos',
  'Recibido',
  'En Diagnostico',
  'Esperando Repuesto',
  'En Reparacion',
  'Listo para Entrega',
  'Entregado',
];

export const ServiceOrdersView: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'Todos'>('Todos');
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  // Modales
  const [selectedOrder, setSelectedOrder] = useState<ServiceOrderDetail | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Estados de formularios
  const [newOrderStatus, setNewOrderStatus] = useState<OrderStatus>('Recibido');
  const [statusComment, setStatusComment] = useState<string>('');
  const [techDiagnosis, setTechDiagnosis] = useState<string>('');
  const [laborCostUpdate, setLaborCostUpdate] = useState<number>(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [statusActionError, setStatusActionError] = useState<string | null>(null);

  // Formulario agregar repuesto
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<number>(0);
  const [partQuantity, setPartQuantity] = useState<number>(1);
  const [isAddingPart, setIsAddingPart] = useState<boolean>(false);
  const [partError, setPartError] = useState<string | null>(null);
  const [isOrderScannerOpen, setIsOrderScannerOpen] = useState<boolean>(false);

  // Formulario nueva orden
  const [createForm, setCreateForm] = useState<CreateServiceOrderRequest>({
    customerId: 1, // Por defecto Cliente demo 1
    technicianId: user?.id || 2,
    deviceType: 'Laptop',
    brand: '',
    model: '',
    serialNumber: '',
    reportedIssue: '',
    technicalDiagnosis: '',
    laborCost: 120000.0,
  });
  const [isCreatingOrder, setIsCreatingOrder] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await ordersApi.getOrders(selectedStatus, search);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, search]);

  const loadInventory = async () => {
    try {
      const items = await inventoryApi.getInventory();
      setInventoryList(items);
      if (items.length > 0) {
        setSelectedInventoryItemId(items[0].id);
      }
    } catch (err) {
      console.error('Error fetching inventory for parts select:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    loadInventory();
  }, []);

  const openOrderDetail = async (orderId: number) => {
    try {
      setIsLoadingDetail(true);
      setStatusActionError(null);
      setPartError(null);
      setIsDetailModalOpen(true);
      const detail = await ordersApi.getOrderById(orderId);
      setSelectedOrder(detail);
      setNewOrderStatus(detail.status);
      setTechDiagnosis(detail.technicalDiagnosis || '');
      setLaborCostUpdate(detail.laborCost);
      setStatusComment('');
    } catch (err: any) {
      console.error('Error fetching order detail:', err);
      setStatusActionError('No se pudo cargar el detalle de la orden.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleQuickPdfDownload = async (orderId: number) => {
    try {
      const detail = await ordersApi.getOrderById(orderId);
      generateOrderPdf(detail);
    } catch (err) {
      console.error('Error al generar PDF de la orden:', err);
      alert('No se pudo cargar la orden para generar el PDF.');
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsUpdatingStatus(true);
      setStatusActionError(null);
      const updated = await ordersApi.updateStatus(selectedOrder.id, {
        status: newOrderStatus,
        comment: statusComment.trim() || undefined,
        technicalDiagnosis: techDiagnosis.trim() || undefined,
        laborCost: laborCostUpdate >= 0 ? laborCostUpdate : undefined,
      });
      setSelectedOrder(updated);
      setStatusComment('');
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.Message || 'Error al actualizar el estado de la orden.';
      setStatusActionError(msg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddPartToOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedInventoryItemId) return;
    try {
      setIsAddingPart(true);
      setPartError(null);
      const updated = await ordersApi.addItem(selectedOrder.id, {
        inventoryItemId: selectedInventoryItemId,
        quantity: partQuantity,
      });
      setSelectedOrder(updated);
      setPartQuantity(1);
      // Actualizar inventario local para reflejar la deducción
      loadInventory();
      fetchOrders();
    } catch (err: any) {
      const msg = err.response?.data?.Message || err.response?.data?.Detail || 'Error al agregar repuesto.';
      setPartError(msg);
    } finally {
      setIsAddingPart(false);
    }
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsCreatingOrder(true);
      setCreateError(null);
      const newOrder = await ordersApi.createOrder(createForm);
      setIsCreateModalOpen(false);
      fetchOrders();
      openOrderDetail(newOrder.id);
    } catch (err: any) {
      const msg = err.response?.data?.Message || 'Error al crear la orden de servicio.';
      setCreateError(msg);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: Title, New Order Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Gestión de Órdenes de Servicio Técnico
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recepción, diagnóstico técnico, trazabilidad de hardware y facturación.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-md shadow-sky-600/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Orden de Servicio</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por N° Orden, Serial, Cliente, Marca..."
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>

        {/* Status Filters Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Estado:
          </span>
          {STATUS_LIST.map((st) => {
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">N° Orden</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Dispositivo / Serial</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Técnico Asignado</th>
                <th className="py-3.5 px-4 text-right">Mano de Obra</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Cargando órdenes de servicio...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No se encontraron órdenes</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pruebe cambiando los filtros de búsqueda o registre una nueva orden.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{ord.customerName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {ord.customerPhone || 'Sin teléfono'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-900 font-medium">
                        {ord.brand} {ord.model}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        S/N: {ord.serialNumber} • {ord.deviceType}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ord.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                          {ord.technicianName?.charAt(0) || 'T'}
                        </div>
                        <span className="truncate max-w-[130px]">
                          {ord.technicianName || 'Sin asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600">
                      {formatCurrency(ord.laborCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(ord.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openOrderDetail(ord.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold transition text-xs border border-slate-200"
                          title="Ver expediente técnico completo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir</span>
                        </button>
                        <button
                          onClick={() => handleQuickPdfDownload(ord.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition border border-slate-200"
                          title="Descargar comprobante en PDF"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL DETALLE DE ORDEN & GESTIÓN TÉCNICA */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Orden de Servicio: ${selectedOrder?.orderNumber || ''}`}
        subtitle="Expediente técnico, trazabilidad de hardware y facturación de repuestos"
        maxWidth="3xl"
      >
        {isLoadingDetail || !selectedOrder ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-600" />
            <span>Cargando expediente técnico...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info bar */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-sky-400 uppercase font-bold tracking-wider">
                  Dispositivo en Diagnóstico
                </span>
                <h4 className="text-base font-bold text-white">
                  {selectedOrder.brand} {selectedOrder.model} ({selectedOrder.deviceType})
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Serial: {selectedOrder.serialNumber} • Ingreso:{' '}
                  {new Date(selectedOrder.createdAt).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="flex md:flex-col items-center md:items-end justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedOrder.status} size="lg" />
                  <button
                    type="button"
                    onClick={() => generateOrderPdf(selectedOrder)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md transition"
                    title="Generar e imprimir orden en formato PDF"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  Total Orden: <span className="text-emerald-400 font-bold text-sm">{formatCurrency(selectedOrder.totalCost)}</span>
                </span>
              </div>
            </div>

            {/* Ficha Cliente & Falla */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                  <User className="w-3.5 h-3.5 text-sky-600" /> Datos del Cliente
                </h5>
                <p className="font-semibold text-slate-900">{selectedOrder.customerName}</p>
                <p className="text-slate-500 font-mono mt-0.5">Doc: {selectedOrder.customerDocument}</p>
                <p className="text-slate-500 mt-0.5">Tel: {selectedOrder.customerPhone || 'N/A'}</p>
                <p className="text-slate-500 mt-0.5">Email: {selectedOrder.customerEmail || 'N/A'}</p>
                <p className="text-slate-500 mt-0.5">Dirección: {selectedOrder.customerAddress || 'N/A'}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] flex items-center gap-1.5 mb-2">
                    <FileText className="w-3.5 h-3.5 text-amber-600" /> Falla Reportada por Cliente
                  </h5>
                  <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 italic">
                    "{selectedOrder.reportedIssue}"
                  </p>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-200 text-slate-500 text-[11px]">
                  Técnico Asignado: <span className="font-semibold text-slate-700">{selectedOrder.technicianName || 'Sin Asignar'}</span>
                </div>
              </div>
            </div>

            {/* SECCIÓN EVIDENCIAS FOTOGRÁFICAS */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-white shadow-xs">
              <OrderPhotoGallery
                orderId={selectedOrder.id}
                orderNumber={selectedOrder.orderNumber}
                images={selectedOrder.images || []}
                onImagesUpdated={() => openOrderDetail(selectedOrder.id)}
                canEdit={true}
              />
            </div>

            {/* SECCIÓN ACTUALIZACIÓN DE ESTADO Y DIAGNÓSTICO */}
            <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40">
              <h5 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-sky-600" /> Actualizar Estado y Diagnóstico Técnico
              </h5>

              {statusActionError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-100 border border-rose-300 text-rose-800 text-xs">
                  {statusActionError}
                </div>
              )}

              <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nuevo Estado de la Orden
                    </label>
                    <select
                      value={newOrderStatus}
                      onChange={(e) => setNewOrderStatus(e.target.value as OrderStatus)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-sky-500"
                    >
                      {STATUS_LIST.filter((s) => s !== 'Todos').map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Costo Mano de Obra ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={laborCostUpdate}
                      onChange={(e) => setLaborCostUpdate(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Diagnóstico Técnico & Solución Aplicada
                  </label>
                  <textarea
                    rows={2}
                    value={techDiagnosis}
                    onChange={(e) => setTechDiagnosis(e.target.value)}
                    placeholder="Detalle la inspección técnica de hardware, pruebas y componentes revisados..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Comentario para el Histórico de Auditoría
                  </label>
                  <input
                    type="text"
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Ej. Notificación enviada al cliente, pruebas concluidas..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition shadow flex items-center gap-1.5"
                  >
                    {isUpdatingStatus ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
                    )}
                    <span>Guardar Cambio de Estado</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SECCIÓN REPUESTOS ASIGNADOS A LA ORDEN (TRANSACCIÓN ACID) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" /> Repuestos & Consumibles Asignados
                </h5>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Subtotal Repuestos:{' '}
                  {formatCurrency(selectedOrder.items.reduce((acc, it) => acc + it.subtotal, 0))}
                </span>
              </div>

              {partError && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{partError}</span>
                </div>
              )}

              {/* Formulario Agregar Repuesto */}
              <form
                onSubmit={handleAddPartToOrder}
                className="mb-4 p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row gap-2.5 items-end text-xs"
              >
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-600 font-semibold">
                      Seleccionar Repuesto del Almacén
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOrderScannerOpen(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded transition border border-sky-200"
                    >
                      <ScanLine className="w-3 h-3" />
                      <span>Escanear Código</span>
                    </button>
                  </div>
                  <select
                    value={selectedInventoryItemId}
                    onChange={(e) => setSelectedInventoryItemId(parseInt(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
                  >
                    {inventoryList.map((item) => (
                      <option key={item.id} value={item.id} disabled={item.stockQuantity <= 0}>
                        {item.name} ({item.sku}) - Stock: {item.stockQuantity} - PVP: {formatCurrency(item.salePrice)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-24">
                  <label className="block text-slate-600 font-semibold mb-1">Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={partQuantity}
                    onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-bold text-center"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingPart}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isAddingPart ? 'Deduciendo...' : 'Cargar a Orden'}</span>
                </button>
              </form>

              {/* Lista de repuestos cargados */}
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] text-slate-500 uppercase font-bold">
                    <tr>
                      <th className="py-2 px-3">SKU</th>
                      <th className="py-2 px-3">Descripción</th>
                      <th className="py-2 px-3 text-center">Cant.</th>
                      <th className="py-2 px-3 text-right">Precio Unit.</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 italic">
                          Aún no se han asignado repuestos a este equipo.
                        </td>
                      </tr>
                    ) : (
                      selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-600">
                            {item.sku}
                          </td>
                          <td className="py-2 px-3 text-slate-800">{item.itemName}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-900">
                            {item.quantity}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-600">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECCIÓN LÍNEA DE TIEMPO / HISTORIAL DE ESTADOS */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h5 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-600" /> Trazabilidad & Auditoría de Estados
              </h5>

              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {selectedOrder.history.map((hist) => (
                  <div key={hist.id} className="relative flex items-start gap-3 pl-1 text-xs">
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0 z-10">
                      •
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200/80 flex-1 shadow-xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={hist.newStatus} size="sm" />
                          {hist.previousStatus && (
                            <span className="text-[11px] text-slate-400">
                              (Previo: {hist.previousStatus})
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(hist.changedAt).toLocaleString('es-CO')}
                        </span>
                      </div>
                      <p className="text-slate-700 mt-1 font-medium">{hist.comment}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Registrado por:{' '}
                        <span className="font-semibold text-slate-600">{hist.changedByUserName}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL REGISTRAR NUEVA ORDEN DE SERVICIO */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Ingreso de Nueva Orden de Servicio Técnico"
        subtitle="El sistema generará automáticamente el correlativo ORD-2026-XXXX"
        maxWidth="2xl"
      >
        {createError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateOrderSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cliente Solicitante
              </label>
              <select
                value={createForm.customerId}
                onChange={(e) =>
                  setCreateForm({ ...createForm, customerId: parseInt(e.target.value) })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                required
              >
                <option value={1}>Mariana Restrepo Gómez (CLI-10203040)</option>
                <option value={2}>Soluciones Digitales S.A.S. (CLI-20304050)</option>
                <option value={3}>Jorge Esteban Morales (CLI-30405060)</option>
                <option value={4}>Carolina Duarte Pardo (CLI-40506070)</option>
                <option value={5}>Laboratorios Médicos del Valle (CLI-50607080)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tipo de Dispositivo
              </label>
              <select
                value={createForm.deviceType}
                onChange={(e) => setCreateForm({ ...createForm, deviceType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
                required
              >
                <option value="Laptop">Laptop / Portátil</option>
                <option value="Desktop">Desktop / Torre Gaming / Workstation</option>
                <option value="All In One">All In One (Todo en Uno)</option>
                <option value="Consola">Consola de Videojuegos</option>
                <option value="Servidor">Servidor Rack / Almacenamiento NAS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Marca</label>
              <input
                type="text"
                required
                placeholder="ej. Dell, Lenovo, Apple"
                value={createForm.brand}
                onChange={(e) => setCreateForm({ ...createForm, brand: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Modelo</label>
              <input
                type="text"
                required
                placeholder="ej. ThinkPad X1 Carbon"
                value={createForm.model}
                onChange={(e) => setCreateForm({ ...createForm, model: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Número de Serial</label>
              <input
                type="text"
                required
                placeholder="ej. SN-882910-K"
                value={createForm.serialNumber}
                onChange={(e) => setCreateForm({ ...createForm, serialNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Falla Reportada por el Cliente
            </label>
            <textarea
              rows={3}
              required
              placeholder="Describa los síntomas reportados por el usuario (ej. No enciende, pantalla azul al iniciar, batería hinchada)..."
              value={createForm.reportedIssue}
              onChange={(e) => setCreateForm({ ...createForm, reportedIssue: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Diagnóstico Inicial Preliminar (Opcional)
              </label>
              <input
                type="text"
                placeholder="Revisión de placa madre / voltajes"
                value={createForm.technicalDiagnosis || ''}
                onChange={(e) =>
                  setCreateForm({ ...createForm, technicalDiagnosis: e.target.value })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mano de Obra Estimada ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={createForm.laborCost}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    laborCost: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isCreatingOrder}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition shadow-md shadow-sky-600/30 flex items-center gap-2"
            >
              {isCreatingOrder ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Registrar e Ingresar Orden</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL ESCÁNER PARA AGREGAR REPUESTOS A LA ORDEN */}
      <BarcodeScannerModal
        isOpen={isOrderScannerOpen}
        onClose={() => setIsOrderScannerOpen(false)}
        inventoryList={inventoryList}
        onItemScanned={(scanned) => {
          setSelectedInventoryItemId(scanned.id);
          setPartQuantity(1);
        }}
        title="Escanear Repuesto para la Orden"
        subtitle="Acerque el repuesto a la cámara o use la pistola para seleccionarlo automáticamente"
        actionButtonText="Asignar este Repuesto"
      />
    </div>
  );
};
