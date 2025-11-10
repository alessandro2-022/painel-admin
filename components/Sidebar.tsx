import React, { useState } from 'react';
import GolyLogo from './icons/GolyLogo';
import ThemeToggle from './ThemeToggle';
import ChartIcon from './icons/ChartIcon';
import MapIcon from './icons/MapIcon';
import RouteIcon from './icons/RouteIcon';
import SettingsIcon from './icons/SettingsIcon';
import PromotionIcon from './icons/PromotionIcon';
import ChatIcon from './icons/ChatIcon';
import LiveIcon from './icons/LiveIcon';
import LogoutIcon from './icons/LogoutIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import UsersIcon from './icons/UsersIcon';

type Page = 'dashboard' | 'map' | 'routes' | 'fares' | 'promotions' | 'drivers' | 'support' | 'live';

interface SidebarProps {
    currentPage: Page;
    onPageChange: (page: Page) => void;
    onLogout: () => void;
}

const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isCollapsed: boolean;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isCollapsed, isActive, onClick }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-[#0057b8] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
            } ${isCollapsed ? 'justify-center' : ''}`}
            aria-label={label}
        >
            {icon}
            {!isCollapsed && <span className="ml-4 font-medium">{label}</span>}
        </button>
    </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartIcon /> },
        { id: 'map', label: 'Mapa ao Vivo', icon: <MapIcon /> },
        { id: 'routes', label: 'Otimizar Rotas', icon: <RouteIcon /> },
        { id: 'fares', label: 'Tarifas', icon: <SettingsIcon /> },
        { id: 'promotions', label: 'Promoções', icon: <PromotionIcon /> },
        { id: 'drivers', label: 'Motoristas', icon: <UsersIcon /> },
        { id: 'support', label: 'Suporte', icon: <ChatIcon /> },
        { id: 'live', label: 'Assistente', icon: <LiveIcon /> },
    ];

    return (
        <aside className={`relative bg-white dark:bg-slate-800 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-700 ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center p-4 border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <GolyLogo className="h-8 w-8" />
                    {!isCollapsed && <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">Goly</span>}
                </div>
            </div>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="absolute -right-3 top-16 z-10 w-6 h-6 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-full flex items-center justify-center text-slate-500 hover:text-[#0057b8] focus:outline-none focus:ring-2 focus:ring-[#0057b8]">
                {isCollapsed ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />}
            </button>
            <nav className="flex-1 px-2 py-4">
                <ul>
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            label={item.label}
                            icon={item.icon}
                            isCollapsed={isCollapsed}
                            isActive={currentPage === item.id}
                            onClick={() => onPageChange(item.id as Page)}
                        />
                    ))}
                </ul>
            </nav>
            <div className="px-2 py-4 border-t border-slate-200 dark:border-slate-700">
                <ThemeToggle isCollapsed={isCollapsed} />
                <button onClick={onLogout} className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 ${isCollapsed ? 'justify-center' : ''}`}>
                    <LogoutIcon />
                    {!isCollapsed && <span className="ml-4 font-medium">Sair</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
