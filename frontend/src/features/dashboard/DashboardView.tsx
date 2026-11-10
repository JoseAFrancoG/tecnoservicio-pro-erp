import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi } from '../../api/dashboardApi';
import { DashboardMetrics } from '../../types';
import { KPICards } from '../../components/KPICards';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  RefreshCw,
  AlertTriangle,
  Boxes,
  TrendingUp,
  PackageX,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToInventory: () => void;
  onNavigateToOrders: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToInventory,
  onNavigateToOrders,
}) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await dashboardApi.getSummary();
      setMetrics(data);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError('No se pudo cargar la información del Dashboard. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Panel de Control & Indicadores Clave
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Métricas consolidadas de rendimiento operativo, facturación y control de almacén.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMetrics}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={onNavigateToOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition shadow-sm shadow-sky-600/30"
          >
            <span>Ver Órdenes</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchMetrics}
            className="font-semibold underline hover:text-rose-900"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <KPICards metrics={metrics} isLoading={isLoading} />

      {/* Charts & Inventory Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Barras: 6 Meses */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-600" />
                Histórico de Ingresos (Últimos 6 Meses)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparativa mensual de facturación: Mano de Obra técnica vs Repuestos de hardware
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Moneda: COP ($)
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-slate-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                  <span>Cargando analítica financiera...</span>
                </div>
              </div>
            ) : metrics?.monthlyRevenues && metrics.monthlyRevenues.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={metrics.monthlyRevenues}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'serviceRevenue' ? 'Mano de Obra' : 'Repuestos',
                    ]}
                    labelFormatter={(label) => `Mes: ${label}`}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    formatter={(val) => (val === 'serviceRevenue' ? 'Mano de Obra' : 'Repuestos')}
                  />
                  <Bar
                    dataKey="serviceRevenue"
                    name="serviceRevenue"
                    fill="#0284c7"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="partsRevenue"
                    name="partsRevenue"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No hay datos históricos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Alertas de Stock Crítico */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Alertas de Stock Crítico
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                {metrics?.criticalStockItems?.length ?? 0} ítems
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Componentes con existencias inferiores o iguales a su nivel mínimo de seguridad.
            </p>

            <div className="space-y-3 overflow-y-auto max-h-64 pr-1">
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-14 bg-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : metrics?.criticalStockItems && metrics.criticalStockItems.length > 0 ? (
                metrics.criticalStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="font-mono text-slate-600">{item.sku}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-rose-600 text-white shadow-sm">
                        {item.stockQuantity} / min {item.minStockAlert}
                      </span>
                      <p className="text-[10px] text-rose-700 font-semibold mt-1">
                        PVP: ${item.salePrice.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-slate-700">Inventario en Nivel Seguro</p>
                  <p className="text-[11px] text-slate-500">
                    No hay componentes con alerta de reorden crítica en este momento.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={onNavigateToInventory}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <Boxes className="w-4 h-4 text-sky-400" />
              <span>Gestionar Inventario Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
