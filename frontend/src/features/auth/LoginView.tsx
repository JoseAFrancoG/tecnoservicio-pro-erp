import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Wrench, Shield, Laptop, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor ingrese correo electrónico y contraseña.');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await login(email, password);
    } catch (err: any) {
      const msg = err.response?.data?.Message || 'Error de autenticación. Verifique sus credenciales.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: 'Admin' | 'Tech') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      await loginAsDemo(role);
    } catch (err: any) {
      const msg = err.response?.data?.Message || 'Error al iniciar sesión con usuario demo.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-sky-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white shadow-lg shadow-sky-500/25 mb-3 border border-sky-400/40">
            <Wrench className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            TecnoServicio <span className="text-sky-400">Pro ERP</span>
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Gestión Integral de Taller Técnico, Hardware e Inventario
          </p>
        </div>

        {/* Card Formulario */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-7 shadow-2xl shadow-black/60">
          <h2 className="text-base font-bold text-white mb-1">Acceso al Sistema</h2>
          <p className="text-xs text-slate-400 mb-6">
            Ingrese sus credenciales de operador o use los perfiles demo.
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ej. admin@techservice.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-600/30 hover:shadow-sky-500/40 transition flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar a la Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Demo Profiles */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3 text-center">
              Acceso Rápido de Prueba (Demo)
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoClick('Admin')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 text-xs font-medium transition hover:border-amber-500/50 group"
              >
                <Shield className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-semibold text-white">Demo Admin</div>
                  <div className="text-[10px] text-slate-400">Control total</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoClick('Tech')}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/70 text-slate-200 text-xs font-medium transition hover:border-sky-500/50 group"
              >
                <Laptop className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <div className="text-left">
                  <div className="font-semibold text-white">Demo Técnico</div>
                  <div className="text-[10px] text-slate-400">Órdenes & taller</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 mt-6 font-medium">
          TecnoServicio Pro ERP • .NET 10 Web API + SQL Server + React 18
        </p>
      </div>
    </div>
  );
};
