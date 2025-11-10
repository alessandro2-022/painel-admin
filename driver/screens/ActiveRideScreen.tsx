import React from 'react';
import { Ride, RideStatus } from '../../types';
import GenericMapBackground from '../../components/GenericMapBackground';
import RouteIcon from '../../components/icons/RouteIcon';

interface ActiveRideScreenProps {
    ride: Ride;
    onUpdateStatus: (newStatus: RideStatus) => void;
}

const ActiveRideScreen: React.FC<ActiveRideScreenProps> = ({ ride, onUpdateStatus }) => {
    
    const getActionInfo = () => {
        switch(ride.status) {
            case 'en_route_to_pickup':
                return {
                    title: 'Dirija-se ao local de embarque',
                    address: ride.pickupLocation,
                    buttonText: 'Cheguei para o Embarque',
                    nextStatus: 'at_pickup' as RideStatus,
                };
            case 'at_pickup':
                 return {
                    title: 'Aguardando o passageiro',
                    address: ride.pickupLocation,
                    buttonText: 'Iniciar Corrida',
                    nextStatus: 'en_route_to_destination' as RideStatus,
                };
            case 'en_route_to_destination':
                 return {
                    title: 'Dirija-se ao destino',
                    address: ride.dropoffLocation,
                    buttonText: 'Finalizar Corrida',
                    nextStatus: 'completed' as RideStatus,
                };
            default:
                return {
                    title: 'Status desconhecido',
                    address: '',
                    buttonText: 'Voltar',
                    nextStatus: 'completed' as RideStatus,
                }
        }
    };

    const { title, address, buttonText, nextStatus } = getActionInfo();

    return (
        <div className="flex flex-col h-full relative">
            <div className="absolute inset-0">
                <GenericMapBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-100 dark:from-slate-900 via-transparent to-slate-100 dark:to-slate-900"></div>
            </div>

            <div className="relative flex-1 flex flex-col justify-between p-4">
                {/* Painel de Informações Superiores */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center text-lg font-bold text-slate-800 dark:text-slate-100">
                        <RouteIcon className="w-6 h-6 mr-3 text-[#0057b8]" />
                        <h2>{title}</h2>
                    </div>
                    <p className="mt-2 pl-9 text-slate-600 dark:text-slate-300">{address}</p>
                </div>
                
                 {/* Painel de Ação Inferior */}
                <div className="space-y-4">
                     <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Valor da Corrida</p>
                        <p className="text-3xl font-bold text-[#0057b8]">R$ {ride.fare.toFixed(2)}</p>
                    </div>

                    <button
                        onClick={() => onUpdateStatus(nextStatus)}
                        className="w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 bg-green-600 hover:bg-green-700"
                    >
                       {buttonText}
                    </button>
                    <button
                        onClick={() => onUpdateStatus('cancelled')}
                        className="w-full py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                    >
                       Cancelar Corrida
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ActiveRideScreen;
