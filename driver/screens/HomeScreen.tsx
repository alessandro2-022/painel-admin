import React from 'react';
import { DriverProfile, Ride } from '../../types';
import GenericMapBackground from '../../components/GenericMapBackground';
import RideRequestCard from '../components/RideRequestCard';

interface HomeScreenProps {
    profile: DriverProfile | null;
    isOnline: boolean;
    rideRequest: Ride | null;
    onToggleOnline: () => void;
    onRideResponse: (accepted: boolean) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ profile, isOnline, rideRequest, onToggleOnline, onRideResponse }) => {
    
    if (!profile) {
        return <div className="p-4">Carregando perfil...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <h1 className="text-xl font-bold">Olá, {profile.name.split(' ')[0]}!</h1>
                <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isOnline ? 'Você está online e pronto para receber corridas.' : 'Você está offline.'}
                </p>
            </div>

            <div className="flex-1 relative flex flex-col">
                <div className="absolute inset-0">
                    <GenericMapBackground />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-100 dark:from-slate-900 to-transparent"></div>
                </div>

                <div className="relative flex-1 flex flex-col justify-end p-4 space-y-4">
                    {rideRequest && (
                        <RideRequestCard request={rideRequest} onResponse={onRideResponse} />
                    )}
                    
                    {!rideRequest && (
                        <button
                            onClick={onToggleOnline}
                            className={`w-full py-4 rounded-xl text-lg font-bold text-white shadow-lg transition-transform transform hover:scale-105 ${
                                isOnline ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                            }`}
                        >
                            {isOnline ? 'Ficar Offline' : 'Ficar Online'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;
