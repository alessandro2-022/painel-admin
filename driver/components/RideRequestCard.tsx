import React, { useState, useEffect } from 'react';
import { RideRequest } from '../../types';

interface RideRequestCardProps {
    request: RideRequest;
    onResponse: (accepted: boolean) => void;
}

const RideRequestCard: React.FC<RideRequestCardProps> = ({ request, onResponse }) => {
    const [timeLeft, setTimeLeft] = useState(30); // 30 segundos para aceitar

    useEffect(() => {
        if (timeLeft <= 0) {
            onResponse(false); // Recusa automaticamente quando o tempo acaba
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(timeLeft - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onResponse]);

    const progressPercentage = (timeLeft / 30) * 100;

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 animate-slide-up">
            <div className="relative mb-3">
                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-green-500 transition-all duration-1000 linear" 
                        style={{ width: `${progressPercentage}%`}}
                    ></div>
                </div>
                 <span className="absolute -top-2 right-0 text-sm font-bold text-slate-600 dark:text-slate-300">{timeLeft}s</span>
            </div>
           
            <div className="text-center mb-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">NOVA CORRIDA</p>
                <p className="text-3xl font-bold text-[#0057b8]">R$ {request.fare.toFixed(2)}</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">{request.etaMinutes} min de distância</p>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">●</span>
                    <div>
                        <p className="font-semibold text-slate-500 dark:text-slate-400">Embarque</p>
                        <p className="text-slate-800 dark:text-slate-200">{request.pickupLocation}</p>
                    </div>
                </div>
                 <div className="flex items-start space-x-2">
                    <span className="text-red-500 mt-1">●</span>
                     <div>
                        <p className="font-semibold text-slate-500 dark:text-slate-400">Destino</p>
                        <p className="text-slate-800 dark:text-slate-200">{request.dropoffLocation}</p>
                    </div>
                </div>
            </div>

            <div className="flex space-x-3 mt-4">
                <button 
                    onClick={() => onResponse(false)}
                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                    Recusar
                </button>
                 <button 
                    onClick={() => onResponse(true)}
                    className="flex-1 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                >
                    Aceitar
                </button>
            </div>
             <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RideRequestCard;
