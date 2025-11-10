import React from 'react';
import { DriverView } from '../../types';
import CarIcon from '../assets/CarIcon';
import DollarIcon from '../assets/DollarIcon';
import SupportIcon from '../assets/SupportIcon';

interface BottomNavBarProps {
    currentView: DriverView;
    setCurrentView: (view: DriverView) => void;
    isRideActive: boolean;
}

const NavItem: React.FC<{
    label: string;
    view: DriverView;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    isDisabled: boolean;
    onClick: () => void;
}> = ({ label, Icon, isActive, isDisabled, onClick }) => {
    
    let colorClass = "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";
    if (isActive && !isDisabled) {
        colorClass = "text-[#0057b8] dark:text-blue-400";
    }
    if (isDisabled) {
        colorClass = "text-slate-300 dark:text-slate-600 cursor-not-allowed";
    }


    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ${colorClass}`}
        >
            <Icon className="h-6 w-6 mb-1" />
            <span className={`text-xs font-semibold ${isActive ? 'font-bold' : ''}`}>{label}</span>
        </button>
    );
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView, isRideActive }) => {
    // A tela inicial (home) sempre deve ser clicável para o motorista poder voltar para a corrida.
    const isHomeDisabled = isRideActive && currentView !== 'home';

    return (
        <nav className="flex-shrink-0 bg-white dark:bg-slate-800 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.2)] flex justify-around border-t border-slate-200 dark:border-slate-700">
            <NavItem 
                label="Início"
                view="home"
                Icon={CarIcon}
                isActive={currentView === 'home'}
                isDisabled={isHomeDisabled}
                onClick={() => setCurrentView('home')}
            />
            <NavItem 
                label="Ganhos"
                view="earnings"
                Icon={DollarIcon}
                isActive={currentView === 'earnings'}
                isDisabled={isRideActive}
                onClick={() => setCurrentView('earnings')}
            />
            <NavItem 
                label="Suporte"
                view="support"
                Icon={SupportIcon}
                isActive={currentView === 'support'}
                isDisabled={isRideActive}
                onClick={() => setCurrentView('support')}
            />
        </nav>
    );
};

export default BottomNavBar;
