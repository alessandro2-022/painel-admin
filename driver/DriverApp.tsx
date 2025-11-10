import React, { useState, useEffect, useCallback } from 'react';
import { DriverView, DriverProfile, Ride, RideStatus } from '../types';
import HomeScreen from './screens/HomeScreen';
import SupportScreen from './screens/SupportScreen';
import BottomNavBar from './components/BottomNavBar';
import GolyLogo from '../components/icons/GolyLogo';
import { listenForRideRequests, updateRideStatus, setDriverOnlineStatus, getDriverProfile } from '../services/apiService';
import ActiveRideScreen from './screens/ActiveRideScreen';
import EarningsScreen from './screens/EarningsScreen';

interface DriverAppProps {
    onLogout: () => void;
}

const DRIVER_ID_FOR_DEMO = 3; // Corresponde ao Carlos Pereira

const DriverApp: React.FC<DriverAppProps> = ({ onLogout }) => {
    const [currentView, setCurrentView] = useState<DriverView>('home');
    const [profile, setProfile] = useState<DriverProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [activeRide, setActiveRide] = useState<Ride | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Em uma aplicação real, o ID do motorista viria de um token de autenticação.
                const userProfile = await getDriverProfile(DRIVER_ID_FOR_DEMO);
                setProfile(userProfile);
            } catch (error) {
                console.error("Failed to fetch driver profile:", error);
                // Tratar erro de carregamento de perfil
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleToggleOnline = useCallback(async () => {
        if (!profile) return;
        const newStatus = !isOnline;
        try {
            await setDriverOnlineStatus(profile.id, newStatus);
            setIsOnline(newStatus);

            if (!newStatus) {
                setActiveRide(null); // Limpa corrida se ficar offline
            }
        } catch (error) {
            console.error("Failed to update online status:", error);
            // Reverter estado da UI ou mostrar um erro
        }
    }, [isOnline, profile]);

    // Ouve por solicitações de corrida quando online, via WebSocket
    useEffect(() => {
        if (isOnline && profile && !activeRide) {
            const unsubscribe = listenForRideRequests(profile.id, (rideRequest) => {
                setActiveRide(rideRequest);
            });
            return () => unsubscribe();
        }
    }, [isOnline, profile, activeRide]);

    const handleRideResponse = async (accepted: boolean) => {
        if (!activeRide) return;
        const newStatus = accepted ? 'en_route_to_pickup' : 'cancelled';
        
        try {
            // A API agora envia a atualização para o backend, que irá notificar
            // via WebSocket sobre o estado atualizado da corrida.
            await updateRideStatus(activeRide.id, newStatus);
            if (newStatus === 'cancelled') {
                setActiveRide(null); // Limpa localmente para uma UI mais rápida
            }
            // Se aceito, esperamos o backend nos enviar a corrida atualizada via WebSocket
        } catch (error) {
            console.error("Failed to respond to ride:", error);
        }
    };

    const handleUpdateRideStatus = async (newStatus: RideStatus) => {
        if (!activeRide) return;
        try {
            await updateRideStatus(activeRide.id, newStatus);
            if (newStatus === 'completed' || newStatus === 'cancelled') {
                setActiveRide(null); // Limpa localmente
            }
        } catch (error) {
            console.error("Failed to update ride status:", error);
        }
    };

    const renderView = () => {
        if (isLoading) {
            return (
                <div className="flex-1 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-[#0057b8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            );
        }

        if (!profile) return <div className="p-4 text-center text-red-500">Não foi possível carregar o perfil do motorista.</div>;
        
        if (activeRide && activeRide.status !== 'request') {
            return <ActiveRideScreen ride={activeRide} onUpdateStatus={handleUpdateRideStatus} />
        }

        switch(currentView) {
            case 'home':
                return <HomeScreen 
                            profile={profile} 
                            isOnline={isOnline}
                            rideRequest={activeRide?.status === 'request' ? activeRide : null}
                            onToggleOnline={handleToggleOnline}
                            onRideResponse={handleRideResponse}
                        />;
            case 'earnings':
                return <EarningsScreen driverId={profile.id} />;
            case 'support':
                return <SupportScreen />;
            default:
                return <HomeScreen 
                            profile={profile}
                            isOnline={isOnline}
                            rideRequest={activeRide?.status === 'request' ? activeRide : null}
                            onToggleOnline={handleToggleOnline}
                            onRideResponse={handleRideResponse}
                        />;
        }
    };

    return (
        <div className="h-screen w-screen max-w-md mx-auto flex flex-col bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 shadow-2xl">
            <header className="flex-shrink-0 bg-white dark:bg-slate-800/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2">
                    <GolyLogo className="h-6 w-6" />
                    <span className="font-bold text-xl">Goly Motorista</span>
                </div>
                {!isLoading && profile && (
                    <div className="flex items-center space-x-3">
                         <img src={profile.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                         <button onClick={onLogout} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500">Sair</button>
                    </div>
                )}
            </header>
            
            <main className="flex-1 overflow-y-auto">
                {renderView()}
            </main>

            <BottomNavBar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                isRideActive={!!activeRide && activeRide.status !== 'request'}
            />
        </div>
    );
};

export default DriverApp;