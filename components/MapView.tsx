import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Driver, DriverStatus } from '../types.ts';
import useGoogleMaps from '../hooks/useGoogleMaps.ts';
// REMOVIDO: import { useTheme } from '../hooks/useTheme.tsx';
// REMOVIDO: import darkMapStyle from '../styles/darkMapStyle.ts';
import MapErrorOverlay from './MapErrorOverlay.tsx';
import { getDrivers, subscribeToDriverLocationUpdates } from '../services/apiService.ts';

const MAP_CENTER = { lat: -23.555, lng: -46.64 };

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
  const { isLoaded, loadError } = useGoogleMaps();
  // REMOVIDO: const [theme] = useTheme();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<{[key: number]: any}>({});
  const infoWindowRef = useRef<any | null>(null);

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

  const openInfoWindowForDriver = useCallback((driver: Driver) => {
      if (!mapInstanceRef.current || !markersRef.current[driver.id] || !(window as any).google?.maps) return;
      
      const currentMap = mapInstanceRef.current;
      const marker = markersRef.current[driver.id];
      
      if (!infoWindowRef.current) {
          infoWindowRef.current = new (window as any).google.maps.InfoWindow();
          // Garante que, se o usuário fechar a info window, o estado seja atualizado.
          infoWindowRef.current.addListener('closeclick', () => {
            setSelectedDriverId(null);
          });
      }
      
      const statusColors = {
        online: 'text-green-600',
        on_trip: 'text-blue-600',
        offline: 'text-slate-500',
      };
      const statusText = {
        online: 'Online',
        on_trip: 'Em Viagem',
        offline: 'Offline',
      };

      const contentString = `
        <div class="p-1 font-sans">
          <h3 class="font-bold text-md text-slate-900">${driver.name}</h3>
          <p class="text-sm text-slate-700">Status: <span class="font-semibold ${statusColors[driver.status]}">${statusText[driver.status]}</span></p>
          <p class="text-xs text-slate-500 mt-1">${driver.position.lat.toFixed(5)}, ${driver.position.lng.toFixed(5)}</p>
        </div>
      `;
      
      infoWindowRef.current.setContent(contentString);
      // Usa a sintaxe moderna recomendada para AdvancedMarkerElement
      infoWindowRef.current.open({ 
        map: currentMap, 
        anchor: marker,
        shouldFocus: false 
      });
  }, []);

  const handleDriverSelect = (driverId: number) => {
      const driver = drivers.find(d => d.id === driverId);
      if (driver && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(driver.position);
          mapInstanceRef.current.setZoom(15);
      }
      setSelectedDriverId(driverId);
  };
  
  // Efeito para inicializar o mapa e aplicar atualizações de tema.
  useEffect(() => {
    // Se o script do Google Maps foi carregado com sucesso e o mapa ainda não foi inicializado.
    if (isLoaded && !loadError && mapRef.current && !mapInstanceRef.current) {
        if ((window as any).google?.maps?.Map) {
            const map = new (window as any).google.maps.Map(mapRef.current, {
                center: MAP_CENTER,
                zoom: 13,
                disableDefaultUI: true,
                mapId: 'DEMO_MAP_ID',
                styles: [], // Sempre usar estilo padrão (claro)
            });
            mapInstanceRef.current = map;
        }
    } 
    // Se o mapa já existe, não há necessidade de atualizar estilos de tema, pois o dark mode foi removido.
    // REMOVIDO: else if (mapInstanceRef.current) {
    // REMOVIDO:     mapInstanceRef.current.setOptions({
    // REMOVIDO:         styles: theme === 'dark' ? darkMapStyle : [],
    // REMOVIDO:     });
    // REMOVIDO: }
  }, [isLoaded, loadError]); // Removida a dependência do 'theme'.

  // Gerencia o estado da InfoWindow com base no motorista selecionado
  useEffect(() => {
    if (selectedDriverId === null) {
      infoWindowRef.current?.close();
      return;
    }
    
    const driver = drivers.find(d => d.id === selectedDriverId);
    if (driver && driver.status !== 'offline') {
      openInfoWindowForDriver(driver);
    } else {
      infoWindowRef.current?.close();
    }
  }, [selectedDriverId, drivers, openInfoWindowForDriver]);
  
  // Atualiza os marcadores quando os motoristas se movem ou o mapa está pronto
  useEffect(() => {
    if (!isLoaded || loadError || !mapInstanceRef.current || !(window as any).google?.maps) return;

    const currentMap = mapInstanceRef.current;
    const activeDrivers = drivers.filter(d => d.status !== 'offline');
    
    activeDrivers.forEach(driver => {
        const position = new (window as any).google.maps.LatLng(driver.position.lat, driver.position.lng);
        const borderColor = driver.status === 'on_trip' ? '#3b82f6' : 'white';

        if (markersRef.current[driver.id]) {
            markersRef.current[driver.id].position = position;
            const content = markersRef.current[driver.id].content as HTMLElement;
            if (content && content.style.borderColor !== borderColor) {
                content.style.borderColor = borderColor;
            }
        } else {
            const img = document.createElement('img');
            img.src = driver.avatarUrl || `https://robohash.org/${driver.name}.png?size=50x50&set=set1`;
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.borderRadius = '50%';
            img.style.border = `2px solid ${borderColor}`;
            img.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            img.style.cursor = 'pointer';
            img.style.transition = 'border-color 0.3s ease';

            const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                position,
                map: currentMap,
                content: img,
                title: driver.name,
            });

            img.addEventListener('click', () => {
              setSelectedDriverId(driver.id);
            });

            markersRef.current[driver.id] = marker;
        }
    });

    // Remove marcadores de motoristas que ficaram offline
    Object.keys(markersRef.current).forEach(driverIdStr => {
      const driverId = parseInt(driverIdStr, 10);
      if (!activeDrivers.some(d => d.id === driverId)) {
          markersRef.current[driverId].map = null;
          delete markersRef.current[driverId];
          if (selectedDriverId === driverId) {
            setSelectedDriverId(null);
          }
      }
    });

  }, [drivers, isLoaded, loadError, selectedDriverId]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom()! + 1);
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.setZoom(mapInstanceRef.current.getZoom()! - 1);
  };
  
  const renderDriverList = () => {
      if (isLoading) {
          return <li className="p-4 text-center text-slate-500">Carregando...</li>;
      }
      if (error) {
          return <li className="p-4 text-center text-red-500">{error}</li>;
      }
      if (drivers.filter(d => d.status !== 'offline').length > 0) {
          return drivers.filter(d => d.status !== 'offline').map(driver => (
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
      return <li className="p-4 text-center text-slate-500">Nenhum motorista ativo.</li>;
  }

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
        {/* Painel de Lista de Motoristas */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-xl shadow-md flex flex-col border border-slate-200 max-h-[40vh] md:max-h-full">
            <h2 className="text-xl font-semibold p-4 border-b border-slate-200 text-slate-900">Motoristas Ativos</h2>
            <ul className="flex-1 overflow-y-auto p-2">
                {renderDriverList()}
            </ul>
        </aside>

        {/* Área do Mapa */}
        <div className="flex-1 bg-white rounded-xl shadow-md relative overflow-hidden border border-slate-200">
            <div ref={mapRef} className="w-full h-full" />
            
            {!isLoaded && !loadError && <div className="absolute inset-0 flex items-center justify-center bg-white"><p className="text-slate-900">Carregando Mapa...</p></div>}
            {loadError && <MapErrorOverlay message={loadError.message} />}

            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-lg text-sm space-y-2">
                <h3 className="font-bold text-slate-900">Legenda</h3>
                <div className="flex items-center space-x-2 text-slate-700">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-white overflow-hidden bg-slate-300" />
                    <span>Online</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-700">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-blue-500 overflow-hidden bg-slate-300" />
                    <span>Em Viagem</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button onClick={handleZoomIn} aria-label="Aproximar" className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-slate-900 font-bold text-2xl hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057b8]">
                    +
                </button>
                <button onClick={handleZoomOut} aria-label="Afastar" className="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-slate-900 font-bold text-2xl hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057b8]">
                    -
                </button>
            </div>
        </div>
    </div>
  );
};

export default MapView;