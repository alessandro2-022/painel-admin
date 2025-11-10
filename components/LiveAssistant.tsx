import React from 'react';

const LiveAssistant: React.FC = () => {
    // O recurso Assistente ao Vivo foi removido a pedido do usuário.
    return (
        <div className="max-w-4xl mx-auto space-y-8 text-center">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md min-h-[400px] flex flex-col justify-center items-center dark:border dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Recurso Desativado</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">O recurso de assistente ao vivo foi desativado conforme solicitado.</p>
            </div>
        </div>
    );
};

export default LiveAssistant;