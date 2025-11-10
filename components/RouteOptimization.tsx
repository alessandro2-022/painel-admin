import React, { useState, useRef, useEffect } from 'react';
import { Stop, OptimizedRoute } from '../types.ts';
import useGoogleMaps from '../hooks/useGoogleMaps.ts';
// REMOVIDO: import { useTheme } from '../hooks/useTheme.tsx';
// REMOVIDO: import darkMapStyle from '../styles/darkMapStyle.ts';
import MapErrorOverlay from './MapErrorOverlay.tsx';

// Center of our map (São Paulo)
const MAP_CENTER = { lat: -23.555, lng: -46.64 };

const RouteOptimization: React.FC = () => {
    const [stops, setStops] = useState<Stop[]>([]);
    const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { isLoaded, loadError } = useGoogleMaps();
    // REMOVIDO: const [theme] = useTheme();

    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any | null>(null);
    const stopMarkersRef = useRef<any[]>([]);
    const directionsRendererRef = useRef<any | null>(null);
    const addressInputRef = useRef<HTMLInputElement>(null);
    const autocompleteRef = useRef<any | null>(null);


    // Efeito para inicializar o mapa e aplicar atualizações de tema.
    useEffect(() => {
        // Se o script do Google Maps foi carregado com sucesso e o mapa ainda não foi inicializado.
        if (isLoaded && !loadError && mapRef.current && !mapInstanceRef.current) {
            if ((window as any).google?.maps?.Map && (window as any).google.maps.places) {
                const map = new (window as any).google.maps.Map(mapRef.current, {
                    center: MAP_CENTER,
                    zoom: 12,
                    disableDefaultUI: true,
                    mapId: 'DEMO_MAP_ID',
                    styles: [], // Sempre usar estilo padrão (claro)
                });
                mapInstanceRef.current = map;

                directionsRendererRef.current = new (window as any).google.maps.DirectionsRenderer({
                    map: map,
                    suppressMarkers: true, // We'll use our own markers
                    polylineOptions: {
                        strokeColor: '#0057b8',
                        strokeWeight: 5,
                        strokeOpacity: 0.8,
                    }
                });

                if (addressInputRef.current) {
                    const autocomplete = new (window as any).google.maps.places.Autocomplete(addressInputRef.current, {
                        fields: ["formatted_address", "geometry"],
                        types: ["address"],
                    });
                    autocompleteRef.current = autocomplete;

                    autocomplete.addListener("place_changed", () => {
                        // FIX: Get the place object directly from the autocomplete service.
                        const place = autocomplete.getPlace();
                        if (place && place.geometry && place.geometry.location && place.formatted_address) {
                            const newStop: Stop = {
                                id: Date.now(),
                                address: place.formatted_address,
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                            };
                            setStops(prevStops => [...prevStops, newStop]);
                            if (addressInputRef.current) {
                                addressInputRef.current.value = "";
                            }
                            setOptimizedRoute(null);
                            if (directionsRendererRef.current) {
                                directionsRendererRef.current.setDirections({ routes: [] });
                            }
                        } else {
                            setError("Por favor, selecione um local válido da lista.");
                        }
                    });
                }
            }
        } 
        // Se o mapa já existe, não há necessidade de atualizar estilos de tema, pois o dark mode foi removido.
        // REMOVIDO: else if (mapInstanceRef.current) {
        // REMOVIDO:     mapInstanceRef.current.setOptions({
        // REMOVIDO:         styles: theme === 'dark' ? darkMapStyle : [],
        // REMOVIDO:     });
        // REMOVIDO: }
    }, [isLoaded, loadError]); // Removida a dependência do 'theme'.

    const handleRemoveStop = (id: number) => {
        setStops(stops.filter(stop => stop.id !== id));
        setOptimizedRoute(null);
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({routes: []});
        }
    };

    const handleClearAll = () => {
        setStops([]);
        setOptimizedRoute(null);
        if (directionsRendererRef.current) {
            directionsRendererRef.current.setDirections({routes: []});
        }
    }

    // Update markers on the map when stops change
    useEffect(() => {
        if (!isLoaded || loadError || !mapInstanceRef.current || !(window as any).google?.maps) return;
        
        stopMarkersRef.current.forEach(marker => marker.map = null);
        stopMarkersRef.current = [];

        if (stops.length === 0) return;

        const bounds = new (window as any).google.maps.LatLngBounds();
        
        stops.forEach((stop, index) => {
            const position = { lat: stop.lat, lng: stop.lng };
            const label = document.createElement('div');
            label.className = `w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-md`;
            label.textContent = `${index + 1}`;

            const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                position,
                map: mapInstanceRef.current,
                content: label,
                title: stop.address
            });
            stopMarkersRef.current.push(marker);
            bounds.extend(position);
        });

        if (!optimizedRoute) {
             if (stops.length > 1) {
                mapInstanceRef.current.fitBounds(bounds, 50); // 50px padding
            } else {
                mapInstanceRef.current.setCenter(bounds.getCenter());
                mapInstanceRef.current.setZoom(14);
            }
        }
    }, [stops, isLoaded, loadError, optimizedRoute]);

    const handleGenerateRoute = () => {
        if (!isLoaded || loadError) {
            setError("O serviço de mapas não está disponível. Verifique sua chave de API.");
            return;
        }

        if (stops.length < 2) {
            setError('Adicione pelo menos duas paradas para gerar uma rota.');
            return;
        }

        if (!(window as any).google?.maps?.DirectionsService) {
            setError("O serviço de direções do mapa não está disponível. A API pode não ter sido carregada corretamente.");
            return;
        }

        setError(null);
        setIsLoading(true);
        setOptimizedRoute(null);
        
        const directionsService = new (window as any).google.maps.DirectionsService();

        const origin = { lat: stops[0].lat, lng: stops[0].lng };
        const destination = { lat: stops[stops.length - 1].lat, lng: stops[stops.length - 1].lng };
        const waypoints = stops.slice(1, -1).map(stop => ({
            location: { lat: stop.lat, lng: stop.lng },
            stopover: true,
        }));
        
        directionsService.route({
            origin: origin,
            destination: destination,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: 'DRIVING',
        }, (result: any, status: string) => {
            setIsLoading(false);
            if (status === 'OK' && result) {
                directionsRendererRef.current?.setDirections(result);

                const route = result.routes[0];
                let totalDistance = 0;
                let totalDuration = 0;
                const reorderedStops: Stop[] = [];

                const originalWaypoints = stops.slice(1, -1);
                reorderedStops.push(stops[0]); // Add origin
                route.waypoint_order.forEach((i: number) => reorderedStops.push(originalWaypoints[i]));
                reorderedStops.push(stops[stops.length - 1]); // Add destination

                for (const leg of route.legs) {
                    totalDistance += leg.distance?.value ?? 0;
                    totalDuration += leg.duration?.value ?? 0;
                }

                setOptimizedRoute({
                    stops: reorderedStops,
                    totalDistance: parseFloat((totalDistance / 1000).toFixed(2)), // meters to km
                    totalDuration: Math.round(totalDuration / 60), // seconds to minutes
                });
            } else {
                setError(`Falha ao gerar rota: ${status}`);
            }
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-md flex flex-col border border-slate-200">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Planeje sua Rota</h2>
                
                <input
                    ref={addressInputRef}
                    type="text"
                    className="w-full p-3 border-slate-300 rounded-md focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
                    placeholder="Digite um endereço para adicionar uma parada"
                />

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
                        disabled={isLoading || stops.length < 2}
                        className="w-full px-6 py-3 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? 'Gerando...' : 'Gerar Rota Otimizada'}
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
                    
                    <div className="flex-1 w-full bg-slate-100 rounded-lg relative overflow-hidden min-h-[300px]">
                        <div ref={mapRef} className="w-full h-full" />
                        {!isLoaded && !loadError && <div className="absolute inset-0 flex items-center justify-center bg-white"><p className="text-slate-900">Carregando Mapa...</p></div>}
                        {loadError && <MapErrorOverlay message={loadError.message} />}
                        {isLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-10">
                                <svg className="animate-spin h-8 w-8 text-[#0057b8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-2 text-slate-700 font-semibold">Otimizando Rota...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteOptimization;