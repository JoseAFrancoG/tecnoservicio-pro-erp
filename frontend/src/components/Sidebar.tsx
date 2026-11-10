import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Boxes,
  LogOut,
  Wrench,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type ActiveTab = 'dashboard' | 'orders' | 'inventory';

interface SidebarProps {
  currentTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { id: 'dashboard' as ActiveTab, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders' as ActiveTab, name: 'Órdenes de Servicio', icon: ClipboardList },
    { id: 'inventory' as ActiveTab, name: 'Inventario & Repuestos', icon: Boxes },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none z-20">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Wrench className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            TecnoServicio <span className="text-sky-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-sky-950 border border-sky-800/60 uppercase">Pro</span>
          </span>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">ERP Empresarial</p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Módulos Principales
        </p>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-600/30'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sky-400 font-bold text-xs shrink-0 border border-slate-600">
              {user?.fullName.charAt(0) ?? 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {user?.role === 'Admin' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400">
                    <ShieldCheck className="w-3 h-3" /> Administrador
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400">
                    <UserCheck className="w-3 h-3" /> Técnico Especialista
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-white hover:bg-rose-950/50 rounded-lg transition-colors border border-transparent hover:border-rose-900/60"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
