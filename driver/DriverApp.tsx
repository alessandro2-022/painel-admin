import React, { useState, useEffect } from 'react';
import { DriverView, DriverProfile } from '../types';
import HomeScreen from './screens/HomeScreen';
import SupportScreen from './screens/SupportScreen';
import BottomNavBar from './components/BottomNavBar';
import GolyLogo from '../components/icons/GolyLogo';

const DriverApp: React.FC = () => {
    const [currentView, setCurrentView] = useState<DriverView>('home');
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Simula o carregamento do perfil do motorista
    useEffect(() => {
        setTimeout(() => {
            setProfile({
                id: 'd-123',
                name: 'Carlos Pereira',
                avatarUrl: 'https://robohash.org/carlos.png?size=80x80'
            });
            setIsLoading(false);
        }, 1000);
    }, []);

    const handleLogout = () => {
      alert('Logout indisponível na versão de desenvolvimento.');
    };

    const renderView = () => {
        if (isLoading) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-[#0057b8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        }

        switch(currentView) {
            case 'home':
                return <HomeScreen profile={profile} />;
            case 'earnings':
                return <div className="p-4 text-center"><h2 className="text-2xl font-bold">Ganhos</h2><p className="text-slate-500">Esta tela exibirá seu histórico de ganhos.</p></div>;
            case 'support':
                return <SupportScreen />;
            default:
                return <HomeScreen profile={profile} />;
        }
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 shadow-2xl">
            <header className="flex-shrink-0 bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <GolyLogo className="h-6 w-6" />
                    <span className="font-bold text-xl">Goly Motorista</span>
                </div>
                {!isLoading && profile && (
                    <div className="flex items-center space-x-3">
                         <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                         <button onClick={handleLogout} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500">Sair</button>
                    </div>
                )}
            </header>
            
            <main className="flex-1 overflow-y-auto">
                {renderView()}
            </main>

            <BottomNavBar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
    );
};

export default DriverApp;