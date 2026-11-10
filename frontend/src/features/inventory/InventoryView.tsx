import React, { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { InventoryItem, CreateInventoryItemRequest } from '../../types';
import { Modal } from '../../components/Modal';
import { BarcodeLabelModal } from '../../components/barcode/BarcodeLabelModal';
import { BarcodeScannerModal } from '../../components/barcode/BarcodeScannerModal';
import { Barcode } from '../../components/barcode/Barcode';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  RefreshCw,
  Tag,
  DollarSign,
  PackageCheck,
  ShieldAlert,
  Barcode as BarcodeIcon,
  ScanLine,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InventoryView: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Modales de Código de Barras
  const [selectedBarcodeItem, setSelectedBarcodeItem] = useState<InventoryItem | null>(null);
  const [isLabelModalOpen, setIsLabelModalOpen] = useState<boolean>(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);

  // Modal Crear Repuesto
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState<CreateInventoryItemRequest>({
    sku: '',
    name: '',
    category: 'Almacenamiento',
    costPrice: 0,
    salePrice: 0,
    stockQuantity: 10,
    minStockAlert: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isGeneratingSku, setIsGeneratingSku] = useState<boolean>(false);

  const fetchAndSetNextSku = async (category: string) => {
    try {
      setIsGeneratingSku(true);
      const res = await inventoryApi.getNextSku(category);
      setCreateForm((prev) => ({ ...prev, category, sku: res.sku }));
    } catch (err) {
      console.warn('Error al autogenerar SKU desde API, usando fallback local:', err);
      const prefix = category.length >= 3 ? category.substring(0, 3).toUpperCase() : 'GEN';
      const randomConsecutive = Math.floor(1000 + Math.random() * 9000);
      setCreateForm((prev) => ({ ...prev, category, sku: `REP-${prefix}-${randomConsecutive}` }));
    } finally {
      setIsGeneratingSku(false);
    }
  };

  const handleOpenCreateModal = () => {
    setCreateError(null);
    setIsCreateModalOpen(true);
    fetchAndSetNextSku(createForm.category || 'Almacenamiento');
  };

  const fetchInventory = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await inventoryApi.getInventory();
      setItems(data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const categories = ['Todas', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalStockUnits = items.reduce((acc, i) => acc + i.stockQuantity, 0);
  const totalValuation = items.reduce((acc, i) => acc + i.costPrice * i.stockQuantity, 0);
  const criticalItemsCount = items.filter((i) => i.stockQuantity <= i.minStockAlert).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setCreateError(null);
      await inventoryApi.createItem(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        sku: '',
        name: '',
        category: 'Almacenamiento',
        costPrice: 0,
        salePrice: 0,
        stockQuantity: 10,
        minStockAlert: 5,
      });
      fetchInventory();
    } catch (err: any) {
      const msg = err.response?.data?.Message || 'Error al registrar el nuevo componente.';
      setCreateError(msg);
    } finally {
      setIsSubmitting(false);
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
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Catálogo de Repuestos & Inventario de Hardware
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Control de existencias, costos de adquisición, precios de venta y umbrales de reorden.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsScannerModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 shadow-sm shrink-0"
          >
            <ScanLine className="w-4 h-4 text-sky-600" />
            <span>Escanear Repuesto</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-md shadow-sky-600/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Repuesto / Ítem</span>
          </button>
        </div>
      </div>

      {/* Mini KPIs de Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Referencias</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{items.length} SKUs</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{totalStockUnits} unidades físicas</p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Valorización en Bodega</p>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">
              {formatCurrency(totalValuation)}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">A precio de costo</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Alertas de Reposición</p>
            <p className="text-xl font-bold text-rose-600 mt-0.5">
              {criticalItemsCount} Componentes
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Stock &le; Umbral mínimo</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por SKU, Nombre de componente o Categoría..."
              className="w-full pl-10 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
            />
          </div>

          <button
            onClick={fetchInventory}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refrescar</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Categoría:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">SKU Referencia</th>
                <th className="py-3.5 px-4">Nombre del Componente</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4 text-center">Stock Actual</th>
                <th className="py-3.5 px-4 text-center">Alerta Mínima</th>
                <th className="py-3.5 px-4 text-right">Costo Unit.</th>
                <th className="py-3.5 px-4 text-right">Precio Venta</th>
                <th className="py-3.5 px-4 text-center">Estado Stock</th>
                <th className="py-3.5 px-4 text-center">Código & Etiqueta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                    <span>Cargando catálogo de inventario...</span>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Boxes className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No hay repuestos que coincidan</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Intente con otro término de búsqueda o categoría.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isCritical = item.stockQuantity <= item.minStockAlert;
                  const margin = item.salePrice - item.costPrice;
                  const marginPercent = ((margin / item.costPrice) * 100).toFixed(0);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isCritical ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{item.sku}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.name}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-bold font-mono text-sm ${
                            isCritical ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {item.stockQuantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono">
                        {item.minStockAlert}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                        {formatCurrency(item.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatCurrency(item.salePrice)}
                        <span className="block text-[10px] font-normal text-emerald-600">
                          +{marginPercent}% margen
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isCritical ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>Stock Crítico</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <PackageCheck className="w-3 h-3 text-emerald-600" />
                            <span>Óptimo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBarcodeItem(item);
                            setIsLabelModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-semibold transition text-xs border border-slate-200"
                          title="Ver e imprimir etiqueta con código de barras"
                        >
                          <BarcodeIcon className="w-3.5 h-3.5 text-sky-600" />
                          <span>Código</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL REGISTRAR NUEVO REPUESTO */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Alta de Repuesto / Componente en Inventario"
        subtitle="Agregue un nuevo producto al almacén con sus costos y alertas de stock"
        maxWidth="xl"
      >
        {createError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{createError}</span>
          </div>
        )}

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Categoría</label>
              <select
                value={createForm.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCreateForm((prev) => ({ ...prev, category: newCat }));
                  fetchAndSetNextSku(newCat);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium"
              >
                <option value="Almacenamiento">Almacenamiento (SSD / HDD)</option>
                <option value="Memoria RAM">Memoria RAM</option>
                <option value="Pantallas">Pantallas & Displays</option>
                <option value="Baterías">Baterías</option>
                <option value="Refrigeración">Refrigeración & Ventiladores</option>
                <option value="Consumibles">Consumibles (Pastas, cintas)</option>
                <option value="Cargadores">Cargadores & Fuentes</option>
                <option value="Accesorios">Accesorios</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1">
                  <span>Código SKU</span>
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-1.5 py-0.2 rounded-full">
                    Automático
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => fetchAndSetNextSku(createForm.category)}
                  disabled={isGeneratingSku}
                  className="text-[10px] text-sky-600 hover:text-sky-800 font-semibold inline-flex items-center gap-1"
                  title="Regenerar correlativo"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingSku ? 'animate-spin' : ''}`} />
                  <span>Regenerar</span>
                </button>
              </div>
              <input
                type="text"
                required
                readOnly
                placeholder="Generando código SKU..."
                value={createForm.sku}
                className="w-full p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold cursor-not-allowed select-all"
              />
            </div>
          </div>

          {/* Previsualización en tiempo real del código de barras a generar */}
          {createForm.sku && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Vista Preliminar de Código de Barras (Code 128)
              </span>
              <div className="flex justify-center">
                <Barcode value={createForm.sku} height={38} barWidth={1.5} showText={true} />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre / Descripción Completa del Repuesto
            </label>
            <input
              type="text"
              required
              placeholder="ej. Ventilador CPU Repuesto Lenovo ThinkPad T14 Gen 2"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Precio de Costo ($ COP)
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                required
                value={createForm.costPrice}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    costPrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Precio de Venta al Cliente ($ COP)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={createForm.salePrice}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    salePrice: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cantidad Inicial en Stock
              </label>
              <input
                type="number"
                min="0"
                required
                value={createForm.stockQuantity}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Umbral de Alerta Mínima
              </label>
              <input
                type="number"
                min="1"
                required
                value={createForm.minStockAlert}
                onChange={(e) =>
                  setCreateForm({
                    ...createForm,
                    minStockAlert: parseInt(e.target.value) || 5,
                  })
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-bold text-rose-600"
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-xl transition shadow-md shadow-sky-600/30 flex items-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Guardar en Inventario</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL ETIQUETA Y CÓDIGO DE BARRAS */}
      <BarcodeLabelModal
        isOpen={isLabelModalOpen}
        onClose={() => setIsLabelModalOpen(false)}
        item={selectedBarcodeItem}
      />

      {/* MODAL LECTOR / ESCÁNER DE CÓDIGO DE BARRAS */}
      <BarcodeScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        inventoryList={items}
        onItemScanned={(scanned) => {
          setSearch(scanned.sku);
          setSelectedBarcodeItem(scanned);
          setIsLabelModalOpen(true);
        }}
        title="Lector de Código de Barras de Almacén"
        subtitle="Identifique repuestos mediante cámara o pistola láser para consultar stock o imprimir etiquetas"
        actionButtonText="Ver Etiqueta & Ficha"
      />
    </div>
  );
};
