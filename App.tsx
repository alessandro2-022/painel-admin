

import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import MapView from './components/MapView.tsx';
import Fares from './components/Fares.tsx';
import Promotions from './components/Promotions.tsx';
import SupportChat from './components/SupportChat.tsx';
import RouteOptimization from './components/RouteOptimization.tsx';
import DriversManagement from './components/DriversManagement.tsx';
import UsersManagement from './components/UsersManagement.tsx';
import ConnectionStatusBanner from './components/ConnectionStatusBanner.tsx';
import RegionManagement from './components/RegionManagement.tsx'; // New
import FinancialReports from './components/FinancialReports.tsx'; // New
import RidesManagement from './components/RidesManagement.tsx'; // New
import CustomerSupport from './components/CustomerSupport.tsx'; // New
import { View } from './types.ts';

const pageTitles: { [key in View]: string } = {
  dashboard: 'Dashboard',
  map: 'Mapa de Motoristas',
  routes: 'Otimização de Rotas',
  fares: 'Configuração de Tarifas',
  promotions: 'Gerenciador de Promoções',
  drivers: 'Gerenciar Motoristas',
  users: 'Gerenciar Usuários',
  support: 'Chat de Suporte',
  'region-management': 'Gestão de Regiões', // New
  'financial-reports': 'Relatórios Financeiros', // New
  'rides-management': 'Gerenciar Corridas', // New
  'customer-support': 'Atendimento ao Cliente', // New
};

const App: React.FC = () => {
    // A autenticação agora é tratada como sempre ativa, removendo a tela de login.
    const [currentView, setCurrentView] = useState<View>('dashboard');
    
    const renderView = useMemo(() => {
        switch (currentView) {
            case 'dashboard': return <Dashboard />;
            case 'map': return <MapView />;
            case 'routes': return <RouteOptimization />;
            case 'fares': return <Fares />;
            case 'promotions': return <Promotions />;
            case 'drivers': return <DriversManagement />;
            case 'users': return <UsersManagement />;
            case 'support': return <SupportChat />;
            case 'region-management': return <RegionManagement />; // New
            case 'financial-reports': return <FinancialReports />; // New
            case 'rides-management': return <RidesManagement />; // New
            case 'customer-support': return <CustomerSupport />; // New
            default: return <Dashboard />;
        }
    }, [currentView]);

    return (
        <div className="flex h-screen bg-white text-slate-900">
            <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex flex-col flex-1 overflow-hidden">
                <ConnectionStatusBanner />
                <Header pageTitle={pageTitles[currentView]} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {renderView}
                </main>
            </div>
        </div>
    );
};

export default App;