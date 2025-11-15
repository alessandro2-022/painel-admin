

import React, { useState } from 'react';
import GolyLogo from './icons/GolyLogo.tsx';
import ChartIcon from './icons/ChartIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import RouteIcon from './icons/RouteIcon.tsx';
import SettingsIcon from './icons/SettingsIcon.tsx';
import PromotionIcon from './icons/PromotionIcon.tsx';
import ChatIcon from './icons/ChatIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import CarIcon from './icons/CarIcon.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import WalletIcon from './icons/WalletIcon.tsx'; // New Icon
import GlobeIcon from './icons/GlobeIcon.tsx'; // New Icon
import ClipboardListIcon from './icons/ClipboardListIcon.tsx'; // New Icon
import HeadsetIcon from './icons/HeadsetIcon.tsx'; // New Icon
import { View } from '../types.ts';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ label, Icon, isActive, isCollapsed, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200
        ${isActive
          ? 'bg-[#0057b8] text-white shadow-md'
          : 'text-slate-700 hover:bg-slate-200'
        }
        ${isCollapsed ? 'justify-center' : ''}`
      }
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <Icon className="h-6 w-6" />
      {!isCollapsed && <span className="ml-4 font-medium">{label}</span>}
    </button>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const navItems = [
    { view: 'dashboard' as View, label: 'Dashboard' },
    { view: 'map' as View, label: 'Mapa' },
    { view: 'rides-management' as View, label: 'Corridas' }, // New
    { view: 'routes' as View, label: 'Otimizar Rota' },
    { view: 'drivers' as View, label: 'Motoristas' },
    { view: 'users' as View, label: 'Usuários' },
    { view: 'promotions' as View, label: 'Promoções' },
    { view: 'fares' as View, label: 'Tarifas' },
    { view: 'region-management' as View, label: 'Regiões' }, // New
    { view: 'financial-reports' as View, label: 'Financeiro' }, // New
    { view: 'customer-support' as View, label: 'Atendimento' }, // New
    { view: 'support' as View, label: 'Suporte IA' },
  ];
  
  // A mapping of view to an icon component
  const iconMap: { [key in View]: React.FC<React.SVGProps<SVGSVGElement>> } = {
      dashboard: ChartIcon,
      map: MapIcon,
      routes: RouteIcon,
      drivers: CarIcon,
      users: UsersIcon,
      promotions: PromotionIcon,
      fares: SettingsIcon,
      support: ChatIcon,
      'region-management': GlobeIcon, // New
      'financial-reports': WalletIcon, // New
      'rides-management': ClipboardListIcon, // New
      'customer-support': HeadsetIcon, // New
  };


  return (
    <nav className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center border-b border-slate-200 p-4 h-16 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center">
            <GolyLogo className="w-8 h-8" />
            {!isCollapsed && <span className="ml-2 text-xl font-bold text-slate-900">Goly</span>}
        </div>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1 rounded-full hover:bg-slate-200 hidden lg:block">
          {isCollapsed ? <ChevronRightIcon className="h-5 w-5" /> : <ChevronLeftIcon className="h-5 w-5" />}
        </button>
      </div>

      <ul className="flex-1 px-2 py-4">
        {navItems.map(item => (
          <NavItem
            key={item.view}
            label={item.label}
            Icon={iconMap[item.view]}
            isActive={currentView === item.view}
            isCollapsed={isCollapsed}
            onClick={() => setCurrentView(item.view)}
          />
        ))}
      </ul>

      <div className="px-2 py-4 border-t border-slate-200">
        {/* REMOVIDO: <ThemeToggle isCollapsed={isCollapsed} /> */}
      </div>
    </nav>
  );
};

export default Sidebar;