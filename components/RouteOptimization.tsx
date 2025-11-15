import React, { useState, useRef, useEffect } from 'react';
import { Stop, OptimizedRoute, SharedMapMarker } from '../types.ts';
import { SharedMap } from './SharedMap.tsx'; // Importa o novo SharedMap

// Center of our map (São Paulo)
const MAP_CENTER = { lat: -23.555, lng: -46.64 };

const RouteOptimization: React.FC = () => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addressInputRef = useRef<HTMLInputElement>(null);

    // O useEffect agora apenas reseta o estado quando o componente é montado/desmontado.
    // Toda a lógica de inicialização do mapa do Google e autocomplete foi removida.
    useEffect(() => {
        // Limpa o input do endereço ao montar
        if (addressInputRef.current) {
            addressInputRef.current.value = "";
        }
        setStops([]);
        setOptimizedRoute(null);
        setError(null);
    }, []);

    const handleAddStop = () => {
        const address = addressInputRef.current?.value.trim();
        if (address) {
            // Em um cenário real com um "mapa próprio" interativo ou outro serviço,
            // você faria uma chamada para geocodificar o endereço aqui para obter lat/lng.
            // Para esta implementação, estamos apenas adicionando um stop simulado.
            const newStop: Stop = {
                id: Date.now(),
                address: address,
                lat: MAP_CENTER.lat + (Math.random() - 0.5) * 0.05, // Simula uma lat/lng próxima
                lng: MAP_CENTER.lng + (Math.random() - 0.5) * 0.05, // Simula uma lat/lng próxima
            };
            setStops(prevStops => [...prevStops, newStop]);
            if (addressInputRef.current) {
                addressInputRef.current.value = "";
            }
            setOptimizedRoute(null);
            setError(null);
        } else {
            setError("Por favor, digite um endereço para adicionar uma parada.");
        }
    };

    const handleRemoveStop = (id: number) => {
        setStops(stops.filter(stop => stop.id !== id));
        setOptimizedRoute(null);
    };

    const handleClearAll = () => {
        setStops([]);
        setOptimizedRoute(null);
        setError(null);
    }

    // A função de gerar rota agora é um placeholder
    const handleGenerateRoute = () => {
        setError('A funcionalidade de otimização de rota e cálculo de distância real requer um serviço de mapeamento geoespacial (ex: Google Maps Directions API) que não está atualmente integrado. O mapa exibido é apenas para fins visuais.');
        setOptimizedRoute(null); // Limpa qualquer rota previamente otimizada
    };

    const mapMarkers: SharedMapMarker[] = stops.map(stop => ({
        id: stop.id,
        lat: stop.lat,
        lng: stop.lng,
        // No avatar/status for stops, so these props are omitted
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col border border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Planeje sua Rota (Funcionalidade Limitada)</h2>
                
                <div className="flex space-x-2">
                    <input
                        ref={addressInputRef}
                        type="text"
                        className="flex-1 p-3 border-slate-300 rounded-md focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
                        placeholder="Digite um endereço para adicionar uma parada"
                        disabled={true} // Desabilitar o input, pois o autocomplete foi removido
                    />
                    <button
                        onClick={handleAddStop}
                        disabled={true} // Desabilitar, pois o input está desativado
                        className="px-4 py-2 bg-slate-400 text-white font-semibold rounded-lg shadow-sm cursor-not-allowed"
                    >
                        Adicionar
                    </button>
                </div>
                <p className="text-sm text-slate-500 mt-2">Adicionar paradas está desativado. Esta funcionalidade requer um serviço de geocodificação.</p>


                <div className="flex-1 mt-4 overflow-y-auto -mr-3 pr-3">
                    <ul className="space-y-2">
                        {stops.map((stop, index) => (
                            <li key={stop.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                                <div className="flex items-start">
                                    <span className="text-sm font-bold text-slate-500 w-6 pt-px">{index + 1}.</span>
                                    <span className="text-slate-900 flex-1">{stop.address}</span>
                                </div>
                                <button onClick={() => handleRemoveStop(stop.id)} className="text-slate-400 hover:text-red-500 ml-2 flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </li>
                        ))}
                         {stops.length === 0 && (
                            <li className="text-center p-4 text-slate-500">Nenhuma parada adicionada.</li>
                        )}
                    </ul>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <div className="mt-6 pt-6 border-t border-slate-200 space-y-2">
                     <button
                        onClick={handleGenerateRoute}
                        disabled={true} // Sempre desabilitado, pois a funcionalidade real foi removida
                        className="w-full px-6 py-3 bg-slate-400 text-white font-semibold rounded-lg shadow-md cursor-not-allowed"
                    >
                        Gerar Rota Otimizada (Desativado)
                    </button>
                    <button
                        onClick={handleClearAll}
                        disabled={isLoading || stops.length === 0}
                        className="w-full px-6 py-2 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 disabled:bg-slate-400/50 disabled:cursor-not-allowed transition-colors"
                    >
                        Limpar Tudo
                    </button>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md flex flex-col border border-slate-200">
                <div className="flex-1 flex flex-col">
                    {optimizedRoute ? (
                        <div className="mb-4">
                            <h2 className="text-xl font-semibold text-slate-900">Rota Otimizada</h2>
                            <div className="flex space-x-8 text-center mt-2 p-4 bg-slate-50 rounded-lg">
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500">Distância Total</p>
                                    <p className="text-2xl font-bold text-[#0057b8]">{optimizedRoute.totalDistance} km</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-500">Duração Estimada</p>
                                    <p className="text-2xl font-bold text-[#0057b8]">{optimizedRoute.totalDuration} min</p>
                                </div>
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-slate-900 mt-4 text-sm">
                                {optimizedRoute.stops.map(stop => <li key={stop.id}>{stop.address}</li>)}
                            </ol>
                        </div>
                    ) : (
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-semibold text-slate-700">Visualização da Rota</h2>
                            <p className="text-slate-500 mt-1">O mapa será atualizado à medida que você adiciona paradas.</p>
                        </div>
                    )}
                    
                    <div className="flex-1 w-full bg-slate-100 rounded-lg relative overflow-hidden min-h-[300px] flex items-center justify-center">
                        <SharedMap
                            center={MAP_CENTER} // Default center, SharedMap will manage view state
                            markers={mapMarkers}
                            // routeGeoJson={...} // No real route data to pass currently
                        />
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white/70 backdrop-blur-sm">
                            <h3 className="text-lg font-semibold text-slate-800">Visualização de Mapa Genérico</h3>
                            <p className="mt-2 text-slate-600">Este mapa é apenas ilustrativo e não interage com dados geoespaciais reais.</p>
                            <p className="mt-2 text-sm text-slate-500">A funcionalidade completa de otimização de rotas foi desativada.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteOptimization;