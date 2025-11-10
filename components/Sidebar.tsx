import React from 'react';
import { View } from '../types';
import ChartIcon from './icons/ChartIcon';
import MapIcon from './icons/MapIcon';
import SettingsIcon from './icons/SettingsIcon';
import PromotionIcon from './icons/PromotionIcon';
import ChatIcon from './icons/ChatIcon';
import ThemeToggle from './ThemeToggle';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import RouteIcon from './icons/RouteIcon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isCollapsed, onToggleCollapse }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartIcon },
    { id: 'map', label: 'Mapa ao Vivo', icon: MapIcon },
    { id: 'routeOptimization', label: 'Otimização de Rota', icon: RouteIcon },
    { id: 'fares', label: 'Tarifas', icon: SettingsIcon },
    { id: 'promotions', label: 'Promoções', icon: PromotionIcon },
    { id: 'support', label: 'Chat de Suporte', icon: ChatIcon },
  ];

  return (
    <aside className={`bg-white dark:bg-slate-800 shadow-lg flex flex-col dark:border-r dark:border-slate-700 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center h-20 border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'justify-center' : 'pl-6'}`}>
        {!isCollapsed && <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">Painel</span>}
      </div>
      <nav className="flex-1 px-2 md:px-4 py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setCurrentView(item.id as View)}
                className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  currentView === item.id
                    ? 'bg-[#0057b8] text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <item.icon className="h-6 w-6" />
                {!isCollapsed && <span className="ml-4 font-medium">{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="px-2 md:px-4 py-2 border-t border-slate-200 dark:border-slate-700">
        <ThemeToggle isCollapsed={isCollapsed} />
        <button
          onClick={onToggleCollapse}
          className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
          aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {isCollapsed ? <ChevronRightIcon className="h-6 w-6" /> : <ChevronLeftIcon className="h-6 w-6" />}
          {!isCollapsed && <span className="ml-4 font-medium">Recolher</span>}
        </button>
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className={`text-center text-xs text-slate-400 dark:text-slate-500 ${isCollapsed ? 'hidden' : 'block'}`}>
          <p>&copy; {new Date().getFullYear()} Goly Inc.</p>
          <p>Painel de Controle v1.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;