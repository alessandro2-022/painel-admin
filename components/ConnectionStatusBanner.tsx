import React from 'react';
import { useConnectionStatus } from '../hooks/useConnectionStatus.ts';

const ConnectionStatusBanner: React.FC = () => {
    const { status, message } = useConnectionStatus();

    // O banner só é exibido em caso de erro.
    if (status !== 'error') {
        return null;
    }

    return (
        <div 
            className="w-full bg-red-600 text-white text-center p-2 text-sm font-semibold z-50 animate-fade-in-down"
            role="alert"
        >
            {message || 'Erro de conexão.'}
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-100%); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ConnectionStatusBanner;