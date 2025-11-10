import React, { useState, useEffect, useRef } from 'react';
import { View, User } from '../types';
import UserIcon from './icons/UserIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import LogoutIcon from './icons/LogoutIcon';

interface HeaderProps {
    currentView: View;
    currentUser: User;
    onLogout: () => void;
    onOpenModal: (modal: 'profile' | 'register') => void;
}

const viewDetails: Record<View, { title: string; subtitle?: string }> = {
    dashboard: { title: 'Dashboard' },
    map: { title: 'Mapa ao Vivo' },
    routeOptimization: { title: 'Otimização de Rota', subtitle: 'Planeje rotas eficientes com múltiplas paradas' },
    fares: { title: 'Gerenciamento de Tarifas' },
    promotions: { title: 'Promoções' },
    support: { title: 'Assistente de Suporte', subtitle: 'Com tecnologia Gemini' },
};


const Header: React.FC<HeaderProps> = ({ currentView, currentUser, onLogout, onOpenModal }) => {
    const { title, subtitle } = viewDetails[currentView];
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMenuClick = (action: () => void) => {
        action();
        setIsDropdownOpen(false);
    }

    return (
        <header className="flex-shrink-0 bg-white dark:bg-slate-800/50 backdrop-blur-sm shadow-sm p-4 sm:p-6 lg:p-8 border-b border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
                    {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
                </div>
                <div ref={dropdownRef} className="relative">
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-haspopup="true"
                        aria-expanded={isDropdownOpen}
                    >
                        <img src={currentUser.avatarUrl} alt="Avatar do usuário" className="h-8 w-8 rounded-full border-2 border-slate-200 dark:border-slate-600" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">{currentUser.name}</span>
                        <svg className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 origin-top-right animate-fade-in-down">
                            <div className="py-1">
                                <button onClick={() => handleMenuClick(() => onOpenModal('profile'))} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <UserIcon className="w-5 h-5 mr-3" />
                                    Ver Perfil
                                </button>
                                {currentUser.role === 'admin' && (
                                     <button onClick={() => handleMenuClick(() => onOpenModal('register'))} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                                        <UserPlusIcon className="w-5 h-5 mr-3" />
                                        Cadastrar Usuário
                                    </button>
                                )}
                                <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                                <button onClick={() => handleMenuClick(onLogout)} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <LogoutIcon className="w-5 h-5 mr-3" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.15s ease-out forwards; }
            `}</style>
        </header>
    );
};

export default Header;