import React from 'react';
import { Wrench, CheckCircle2, DollarSign, AlertTriangle } from 'lucide-react';
import { DashboardMetrics } from '../types';

interface KPICardsProps {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics, isLoading }) => {
  const cards = [
    {
      title: 'Órdenes Activas',
      value: metrics?.activeOrders ?? 0,
      format: (val: number) => val.toString(),
      subtitle: 'En laboratorio y taller',
      icon: Wrench,
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      indicator: 'Operaciones en curso',
      indicatorColor: 'text-blue-700 bg-blue-100/60',
    },
    {
      title: 'Listos para Entrega',
      value: metrics?.readyForDelivery ?? 0,
      format: (val: number) => val.toString(),
      subtitle: 'Esperando retiro de cliente',
      icon: CheckCircle2,
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
      indicator: 'Pendiente de cobro final',
      indicatorColor: 'text-teal-700 bg-teal-100/60',
    },
    {
      title: 'Ingresos del Mes',
      value: metrics?.currentMonthRevenue ?? 0,
      format: (val: number) =>
        new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0,
        }).format(val),
      subtitle: 'Órdenes entregadas cerradas',
      icon: DollarSign,
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      indicator: 'Mano de obra + Repuestos',
      indicatorColor: 'text-emerald-700 bg-emerald-100/60',
    },
    {
      title: 'Alertas Stock Bajo',
      value: metrics?.lowStockAlertsCount ?? 0,
      format: (val: number) => val.toString(),
      subtitle: 'Por debajo del mínimo seguro',
      icon: AlertTriangle,
      textColor: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      indicator: metrics?.lowStockAlertsCount ? 'Requiere reorden inmediata' : 'Inventario óptimo',
      indicatorColor: metrics?.lowStockAlertsCount
        ? 'text-rose-700 bg-rose-100'
        : 'text-slate-600 bg-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-slate-200 animate-pulse rounded mt-2"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    {card.format(card.value)}
                  </h3>
                )}
              </div>
              <div className={`p-3 rounded-xl ${card.bgColor} ${card.borderColor} border`}>
                <Icon className={`w-5 h-5 ${card.textColor}`} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">{card.subtitle}</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${card.indicatorColor}`}>
                {card.indicator}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
