import React from 'react';
import GolyLogo from './icons/GolyLogo';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg dark:bg-slate-800 dark:border dark:border-slate-700">
        <div className="flex flex-col items-center">
          <GolyLogo className="w-12 h-12 mb-2" />
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Goly</h1>
          <p className="text-slate-500 dark:text-slate-400">Painel de Controle</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onLoginSuccess}
            className="group relative flex justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-[#0057b8] border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;