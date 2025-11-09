import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Fares from './components/Fares';
import Promotions from './components/Promotions';
import SupportChat from './components/SupportChat';
import LiveAssistant from './components/LiveAssistant';
import Header from './components/Header';
import { View } from './types';
import RouteOptimization from './components/RouteOptimization';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderAdminView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return <MapView />;
      case 'routeOptimization':
        return <RouteOptimization />;
      case 'fares':
        return <Fares />;
      case 'promotions':
        return <Promotions />;
      case 'support':
        return <SupportChat />;
      case 'live':
        return <LiveAssistant />;
      default:
        return <Dashboard />;
    }
  };

  const handleLogout = () => {
    // Em uma aplicação real, isso limparia tokens de autenticação, etc.
    // Por enquanto, apenas um alerta para indicar que a funcionalidade está desativada no modo de desenvolvimento.
    alert('Logout indisponível na versão de desenvolvimento.');
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header currentView={currentView} />
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderAdminView()}
        </div>
      </main>
    </div>
  );
};

export default App;