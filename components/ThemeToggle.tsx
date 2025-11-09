import React from 'react';
import { useTheme } from '../hooks/useTheme';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface ThemeToggleProps {
  isCollapsed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isCollapsed }) => {
  const [theme, toggleTheme] = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center w-full p-3 my-1 rounded-lg transition-colors duration-200 text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 ${isCollapsed ? 'justify-center' : ''}`}
      aria-label={`Mudar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <MoonIcon className="h-6 w-6" /> : <SunIcon className="h-6 w-6" />}
      {!isCollapsed && (
        <span className="ml-4 font-medium">
          {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;