import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Driver, DriverStatus, GeolocationStatus, LatLng, GroundingSource, SharedMapMarker } from '../types.ts';
import { getDrivers, subscribeToDriverLocationUpdates } from '../services/apiService.ts';
import { getGroundedResponse } from '../services/geminiService.ts';
import { SharedMap } from './SharedMap.tsx'; // Importa o novo SharedMap

const MAP_CENTER = { lat: -23.555, lng: -46.64 }; // Default center for São Paulo

const DriverStatusIndicator: React.FC<{ status: DriverStatus }> = ({ status }) => {
    const statusInfo = {
      online: { text: 'Online', color: 'text-green-600' },
      on_trip: { text: 'Em Viagem', color: 'text-blue-600' },
      offline: { text: 'Offline', color: 'text-slate-500' },
    };
    return <p className={`text-xs font-medium ${statusInfo[status].color}`}>{statusInfo[status].text}</p>;
};

const MapView: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');

  // Grounding states
  const [groundingQuery, setGroundingQuery] = useState('');
  const [groundingResults, setGroundingResults] = useState<{ text: string; sources?: GroundingSource[] } | null>(null);
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  // Filter status for drivers on map/list
  const [filterStatus, setFilterStatus] = useState<DriverStatus | 'all'>('all');

  // --- Geolocation ---
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeolocationStatus('error');
      console.warn("Geolocation is not supported by your browser.");
      return;
    }

    setGeolocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeolocationStatus('available');
      },
      (geoError) => {
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setGeolocationStatus('denied');
          console.warn("Geolocation permission denied by user.");
        } else {
          setGeolocationStatus('error');
          console.error("Geolocation error:", geoError);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // Carregamento inicial e inscrição para atualizações
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const initialDrivers = await getDrivers();
        setDrivers(initialDrivers);
      } catch (error) {
        console.error("Failed to fetch initial drivers", error);
        setError("Não foi possível carregar os motoristas.");
      } finally {
        setIsLoading(false);
      }

      const unsubscribe = subscribeToDriverLocationUpdates((updatedDriverList) => {
        setDrivers(updatedDriverList);
      });

      return () => unsubscribe();
    };

    fetchAndSubscribe();
  }, []);

  const handleDriverSelect = (driverId: number | string) => {
      setSelectedDriverId(prevId => prevId === driverId ? null : (driverId as number)); // Toggle selection
  };
  
  // --- Grounding Search Handlers ---
  const handleGroundingSearch = async () => {
    if (!groundingQuery.trim()) return;

    setIsGroundingLoading(true);
    setGroundingError(null);
    setGroundingResults(null);

    // Fallback location if user's location is not available
    const locationForGrounding = userLocation || {
      latitude: MAP_CENTER.lat,
      longitude: MAP_CENTER.lng
    };

    try {
      const response = await getGroundedResponse(groundingQuery, locationForGrounding);

      const sources: GroundingSource[] = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
          uri: chunk.maps?.uri || chunk.web?.uri,
          title: chunk.maps?.title || chunk.web?.title,
        }))
        .filter((source: GroundingSource) => source.uri && source.title) ?? [];

      setGroundingResults({
        text: response.text,
        sources: sources.length > 0 ? sources : undefined,
      });
    } catch (e) {
      setGroundingError('Falha ao obter resultados da busca. Tente novamente.');
      console.error("Grounding search failed:", e);
    } finally {
      setIsGroundingLoading(false);
    }
  };

  const handleClearGroundingResults = () => {
    setGroundingQuery('');
    setGroundingResults(null);
    setGroundingError(null);
  };
  
  const renderDriverList = () => {
      if (isLoading) {
          return <li className="p-4 text-center text-slate-500">Carregando...</li>;
      }
      if (error) {
          return <li className="p-4 text-center text-red-500">{error}</li>;
      }

      const filteredAndActiveDrivers = drivers.filter(d => 
        (filterStatus === 'all' && d.status !== 'offline') || 
        (filterStatus !== 'all' && d.status === filterStatus)
      );

      if (filteredAndActiveDrivers.length > 0) {
          return filteredAndActiveDrivers.map(driver => (
              <li key={driver.id}>
                  <button
                      onClick={() => handleDriverSelect(driver.id)}
                      className={`w-full flex items-center p-3 text-left rounded-lg transition-colors duration-150 ${
                          selectedDriverId === driver.id 
                          ? 'bg-blue-100'
                          : 'hover:bg-slate-100'
                      }`}
                  >
                      <img src={driver.avatarUrl || `https://robohash.org/${driver.name}.png?size=50x50`} alt={driver.name} className="w-10 h-10 rounded-full mr-3 border-2 border-slate-200" />
                      <div>
                          <p className="font-semibold text-slate-900">{driver.name}</p>
                          <DriverStatusIndicator status={driver.status} />
                      </div>
                  </button>
              </li>
          ));
      }
      return <li className="p-4 text-center text-slate-500">Nenhum motorista ativo com este filtro.</li>;
  }

  // Helper for geolocation status icon
  const getGeolocationIcon = () => {
    switch (geolocationStatus) {
      case 'loading': return <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
      case 'available': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
      case 'denied':
      case 'error': return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
      default: return null;
    }
  };

  const getGeolocationMessage = () => {
    switch (geolocationStatus) {
      case 'loading': return "Obtendo localização...";
      case 'available': return "Localização disponível";
      case 'denied': return "Permissão de localização negada";
      case 'error': return "Erro ao obter localização";
      default: return "";
    }
  };

  const selectedDriver = selectedDriverId ? drivers.find(d => d.id === selectedDriverId) : null;

  const mapMarkers: SharedMapMarker[] = drivers
    .filter(d => 
        (filterStatus === 'all' && d.status !== 'offline') || 
        (filterStatus !== 'all' && d.status === filterStatus)
    )
    .map(driver => ({
        id: driver.id,
        lat: driver.position.lat,
        lng: driver.position.lng,
        avatarUrl: driver.avatarUrl,
        status: driver.status,
        name: driver.name, // Pass the driver's name to the marker
    }));

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
        {/* Painel Esquerdo: Resultados da Busca e Lista de Motoristas */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-xl shadow-md flex flex-col border border-slate-200 max-h-[40vh] md:max-h-full">
            {/* Dropdown de Filtro de Status */}
            <div className="p-4 border-b border-slate-200">
                <label htmlFor="driver-status-filter" className="block text-sm font-medium text-slate-600 mb-1">Filtrar Motoristas por Status</label>
                <select
                    id="driver-status-filter"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as DriverStatus | 'all')}
                    className="w-full p-2 border-slate-300 rounded-md shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
                >
                    <option value="all">Todos os Status</option>
                    <option value="online">Online</option>
                    <option value="on_trip">Em Viagem</option>
                    <option value="offline">Offline</option>
                </select>
            </div>
            {/* Seção de Resultados da Busca (Maps Grounding) */}
            {(groundingResults || groundingError || isGroundingLoading) && (
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Resultados da Pesquisa</h3>
                    <button onClick={handleClearGroundingResults} className="text-slate-500 hover:text-slate-700 p-1 rounded-full hover:bg-slate-200" aria-label="Limpar resultados">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  {isGroundingLoading ? (
                      <div className="flex items-center space-x-2 text-slate-600">
                          <svg className="animate-spin h-5 w-5 text-[#0057b8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          <span>Buscando...</span>
                      </div>
                  ) : groundingError ? (
                      <p className="text-red-500 text-sm">{groundingError}</p>
                  ) : groundingResults && (
                      <div className="space-y-3">
                          <p className="text-slate-800 text-sm whitespace-pre-wrap">{groundingResults.text}</p>
                          {groundingResults.sources && groundingResults.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-200">
                                  <h4 className="text-xs font-semibold mb-1 text-slate-700">Fontes:</h4>
                                  <ul className="space-y-1">
                                      {groundingResults.sources.map((source, index) => (
                                          <li key={index}>
                                              <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                                                  {source.title}
                                              </a>
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                          )}
                      </div>
                  )}
              </div>
            )}

            {/* Lista de Motoristas Ativos */}
            <h2 className="text-xl font-semibold p-4 border-b border-slate-200 text-slate-900">Motoristas Ativos</h2>
            <ul className="flex-1 overflow-y-auto p-2">
                {renderDriverList()}
            </ul>
        </aside>

        {/* Área do Mapa */}
        <div className="flex-1 bg-white rounded-xl shadow-md relative overflow-hidden border border-slate-200">
            {/* Grounding Search Bar */}
            <div className="absolute top-4 left-4 right-4 z-10 flex space-x-2">
                <input
                    type="text"
                    value={groundingQuery}
                    onChange={(e) => setGroundingQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGroundingSearch()}
                    className="flex-1 p-3 border-slate-300 rounded-lg shadow-sm focus:ring-[#0057b8] focus:border-[#0057b8] text-slate-900"
                    placeholder="Pesquisar no mapa (ex: restaurantes próximos)..."
                    aria-label="Pesquisar no mapa"
                />
                <button
                    onClick={handleGroundingSearch}
                    disabled={isGroundingLoading || !groundingQuery.trim()}
                    className="px-5 py-2 bg-[#0057b8] text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                    {isGroundingLoading ? 'Buscando...' : 'Pesquisar'}
                </button>
            </div>


            <div className="w-full h-full relative overflow-hidden">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                        <p className="text-slate-900">Carregando Motoristas...</p>
                    </div>
                ) : error ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-50/70 backdrop-blur-sm">
                        <div className="text-center bg-white p-8 rounded-lg shadow-2xl border border-red-200 max-w-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-semibold text-red-800">Erro ao Carregar Dados</h3>
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                ) : (
                    <SharedMap
                        center={MAP_CENTER} // Default center, SharedMap will manage view state
                        markers={mapMarkers}
                        selectedMarkerId={selectedDriverId}
                        onMarkerClick={handleDriverSelect}
                    >
                        {selectedDriver && (
                            <div 
                                className="absolute bg-white p-2 rounded-lg shadow-lg border border-slate-200 z-50 text-sm"
                                style={{
                                    left: `calc(${50 + (selectedDriver.position.lng - MAP_CENTER.lng) * 1500 + 30}%)`, // Position relative to map center, then adjust
                                    top: `calc(${50 + (MAP_CENTER.lat - selectedDriver.position.lat) * 1500 - 30}%)`, // Position relative to map center, then adjust
                                    transform: 'translate(-50%, -100%)', // Center the tooltip above the marker
                                    pointerEvents: 'none', // Allow clicks to pass through to the map
                                }}
                            >
                                <p className="font-bold text-slate-900">{selectedDriver.name}</p>
                                <DriverStatusIndicator status={selectedDriver.status} />
                                <p className="text-xs text-slate-500 mt-1">{selectedDriver.position.lat.toFixed(5)}, {selectedDriver.position.lng.toFixed(5)}</p>
                            </div>
                        )}
                    </SharedMap>
                )}
            </div>
            
            {/* Geolocation Status Indicator */}
            {geolocationStatus !== 'idle' && (
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg shadow-lg text-sm flex items-center space-x-2">
                    {getGeolocationIcon()}
                    <span className="text-slate-700">{getGeolocationMessage()}</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default MapView;