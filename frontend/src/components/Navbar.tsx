import React from 'react';
import { Calendar, Bell, Shield, Laptop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  pageTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle }) => {
  const { user } = useAuth();
  const today = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-10 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-slate-800 tracking-tight">{pageTitle}</h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Servidor Conectado
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Fecha */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="capitalize">{today}</span>
        </div>

        {/* Notificaciones */}
        <button
          title="Notificaciones de taller"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Chip */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-800 leading-tight">{user?.fullName}</p>
            <p className="text-[11px] text-slate-500 font-medium">{user?.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.role === 'Admin' ? (
              <Shield className="w-4 h-4 text-amber-400" />
            ) : (
              <Laptop className="w-4 h-4 text-sky-400" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
