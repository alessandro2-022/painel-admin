import React, { useState, useEffect } from 'react';
import { Ride } from '../../types';
import { getDriverEarnings } from '../../services/apiService';

const EarningsScreen: React.FC<{ driverId: number }> = ({ driverId }) => {
    const [rides, setRides] = useState<Ride[]>([]);
    const [totalToday, setTotalToday] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEarnings = async () => {
            setIsLoading(true);
            try {
                const earningsData = await getDriverEarnings(driverId);
                setRides(earningsData.recentRides);
                setTotalToday(earningsData.totalToday);
            } catch (error) {
                console.error("Failed to fetch earnings", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEarnings();
    }, [driverId]);

    const formatDate = (dateString: string) => new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <h1 className="text-xl font-bold text-center">Meus Ganhos</h1>
            </div>

            <div className="p-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">GANHOS DE HOJE</p>
                    <p className="text-4xl font-bold text-green-600 dark:text-green-400 mt-1">R$ {totalToday.toFixed(2)}</p>
                </div>
            </div>

            <div className="flex-1 p-4 pt-0 overflow-y-auto">
                <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Histórico de Corridas</h2>
                {isLoading ? (
                    <p className="text-center text-slate-500 dark:text-slate-400">Carregando histórico...</p>
                ) : rides.length === 0 ? (
                    <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400">Nenhuma corrida concluída ainda.</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Fique online para começar a receber corridas!</p>
                    </div>
                ) : (
                    <ul className="space-y-3">
                        {rides.map(ride => (
                            <li key={ride.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{ride.dropoffLocation}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(ride.completedAt!)}</p>
                                </div>
                                <p className="font-bold text-lg text-slate-700 dark:text-slate-300">R$ {ride.fare.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EarningsScreen;
