import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginView } from './features/auth/LoginView';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './features/dashboard/DashboardView';
import { ServiceOrdersView } from './features/orders/ServiceOrdersView';
import { InventoryView } from './features/inventory/InventoryView';

const MainLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Inicializando TecnoServicio Pro ERP...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Panel Principal & Métricas Operativas';
      case 'orders':
        return 'Control de Órdenes de Servicio Técnico';
      case 'inventory':
        return 'Inventario de Repuestos & Hardware';
      default:
        return 'TecnoServicio Pro ERP';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar Fijo */}
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Navbar pageTitle={getPageTitle()} />

        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToInventory={() => setCurrentTab('inventory')}
              onNavigateToOrders={() => setCurrentTab('orders')}
            />
          )}

          {currentTab === 'orders' && <ServiceOrdersView />}

          {currentTab === 'inventory' && <InventoryView />}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

export default App;
