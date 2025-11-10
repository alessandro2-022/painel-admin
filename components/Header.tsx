import React from 'react';
import { View } from '../types';
import GolyLogo from './icons/GolyLogo';

interface HeaderProps {
    currentView: View;
}

const viewDetails: Record<View, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard' },
    map: { title: 'Mapa ao Vivo' },
    routeOptimization: { title: 'Otimização de Rota', subtitle: 'Planeje rotas eficientes com múltiplas paradas' },
    fares: { title: 'Gerenciamento de Tarifas' },
    promotions: { title: 'Promoções' },
    support: { title: 'Assistente de Suporte', subtitle: 'Com tecnologia Gemini' },
};


const Header: React.FC<HeaderProps> = ({ currentView }) => {
    const { title, subtitle } = viewDetails[currentView];

    const handleProfileClick = () => {
        alert('A interface de modificação de dados seria aberta aqui.');
    };

    return (
        <header className="flex-shrink-0 bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm p-4 sm:p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
                    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <button 
                    onClick={handleProfileClick}
                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <GolyLogo className="h-5 w-5" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Goly</span>
                </button>
            </div>
        </header>
    );
};

export default Header;