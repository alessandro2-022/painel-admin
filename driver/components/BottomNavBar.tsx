import React from 'react';
import { DriverView } from '../../types';
import CarIcon from '../assets/CarIcon';
import DollarIcon from '../assets/DollarIcon';
import SupportIcon from '../assets/SupportIcon';

interface BottomNavBarProps {
    currentView: DriverView;
    setCurrentView: (view: DriverView) => void;
}

const NavItem: React.FC<{
    label: string;
    view: DriverView;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, Icon, isActive, onClick }) => {
    const activeColor = "text-[#0057b8] dark:text-blue-400";
    const inactiveColor = "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200";

    return (
        <button
            onClick={onClick}
            className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ${isActive ? activeColor : inactiveColor}`}
        >
            <Icon className="h-6 w-6 mb-1" />
            <span className={`text-xs font-semibold ${isActive ? 'font-bold' : ''}`}>{label}</span>
        </button>
    );
};


const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, setCurrentView }) => {
    return (
        <nav className="flex-shrink-0 bg-white dark:bg-slate-800 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.2)] flex justify-around border-t border-slate-200 dark:border-slate-700">
            <NavItem 
                label="Início"
                view="home"
                Icon={CarIcon}
                isActive={currentView === 'home'}
                onClick={() => setCurrentView('home')}
            />
            <NavItem 
                label="Ganhos"
                view="earnings"
                Icon={DollarIcon}
                isActive={currentView === 'earnings'}
                onClick={() => setCurrentView('earnings')}
            />
            <NavItem 
                label="Suporte"
                view="support"
                Icon={SupportIcon}
                isActive={currentView === 'support'}
                onClick={() => setCurrentView('support')}
            />
        </nav>
    );
};

export default BottomNavBar;
