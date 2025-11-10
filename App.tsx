import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import Fares from './components/Fares';
import Promotions from './components/Promotions';
import SupportChat from './components/SupportChat';
import LiveAssistant from './components/LiveAssistant';
import RouteOptimization from './components/RouteOptimization';
import DriversManagement from './components/DriversManagement';
import Login from './components/Login';

type Page = 'dashboard' | 'map' | 'routes' | 'fares' | 'promotions' | 'drivers' | 'support' | 'live';

const pageTitles: Record<Page, string> = {
    dashboard: 'Dashboard',
    map: 'Mapa ao Vivo',
    routes: 'Otimização de Rotas',
    fares: 'Configuração de Tarifas',
    promotions: 'Gerenciamento de Promoções',
    drivers: 'Gerenciamento de Motoristas',
    support: 'Chat de Suporte',
    live: 'Assistente ao Vivo',
};

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'map':
                return <MapView />;
            case 'routes':
                return <RouteOptimization />;
            case 'fares':
                return <Fares />;
            case 'promotions':
                return <Promotions />;
            case 'drivers':
                return <DriversManagement />;
            case 'support':
                return <SupportChat />;
            case 'live':
                return <LiveAssistant />;
            default:
                return <Dashboard />;
        }
    };
    
    if (!isLoggedIn) {
        return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
    }

    return (
        <div className="h-screen w-screen flex bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
            <Sidebar 
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onLogout={() => setIsLoggedIn(false)}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header pageTitle={pageTitles[currentPage]} />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default App;
