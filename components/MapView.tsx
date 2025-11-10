import React, { useState, useEffect, useRef } from 'react';
import { Driver, DriverStatus } from '../types';
import useGoogleMaps from '../hooks/useGoogleMaps';
import { useTheme } from '../hooks/useTheme';
import darkMapStyle from '../styles/darkMapStyle';
import MapErrorOverlay from './MapErrorOverlay';
import { getDrivers, subscribeToDriverLocationUpdates } from '../services/apiService';

const MAP_CENTER = { lat: -23.555, lng: -46.64 };

const DriverStatusIndicator: React.FC<{ status: DriverStatus }> = ({ status }) => {
    const statusInfo = {
      online: { text: 'Online', color: 'text-green-600 dark:text-green-400' },
      on_trip: { text: 'Em Viagem', color: 'text-blue-600 dark:text-blue-400' },
      offline: { text: 'Offline', color: 'text-slate-500 dark:text-slate-400' },
    };
    return <p className={`text-xs font-medium ${statusInfo[status].color}`}>{statusInfo[status].text}</p>;
};

const MapView: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const [theme] = useTheme();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<{[key: number]: any}>({});
  const infoWindowRef = useRef<any | null>(null);

  const driversRef = useRef(drivers);
  useEffect(() => {
    driversRef.current = drivers;
  }, [drivers]);

  // Carregamento inicial e inscrição para atualizações
  useEffect(() => {
    const fetchAndSubscribe = async () => {
      setIsLoading(true);
      try {
        const initialDrivers = await getDrivers();
        setDrivers(initialDrivers);
      } catch (error) {
        console.error("Failed to fetch initial drivers", error);
      } finally {
        setIsLoading(false);
      }

      // Agora, em vez de simular, estamos nos inscrevendo em um ouvinte de eventos
      // que será acionado pelo nosso serviço WebSocket.
      const unsubscribe = subscribeToDriverLocationUpdates((updatedDriverList) => {
        // O backend pode enviar a lista completa ou apenas as atualizações.
        // Assumindo que envia a lista completa para simplicidade.
        setDrivers(updatedDriverList);
      });

      return () => unsubscribe();
    };

    fetchAndSubscribe();
  }, []);

  const openInfoWindowForDriver = (driver: Driver) => {
      if (!mapInstanceRef.current || !markersRef.current[driver.id] || !(window as any).google?.maps) return;
      
      const currentMap = mapInstanceRef.current;
      const marker = markersRef.current[driver.id];
      
      if (!infoWindowRef.current) {
          infoWindowRef.current = new (window as any).google.maps.InfoWindow();
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
          <h3 class="font-bold text-md text-slate-800">${driver.name}</h3>
          <p class="text-sm text-slate-600">Status: <span class="font-semibold ${statusColors[driver.status]}">${statusText[driver.status]}</span></p>
          <p class="text-xs text-slate-400 mt-1">${driver.position.lat.toFixed(5)}, ${driver.position.lng.toFixed(5)}</p>
        </div>
      `;
      
      infoWindowRef.current.setContent(contentString);
      infoWindowRef.current.open(currentMap, marker);
  };

  const handleDriverSelect = (driverId: number) => {
      setSelectedDriverId(driverId);
      const driver = drivers.find(d => d.id === driverId);
      if (driver && mapInstanceRef.current) {
          mapInstanceRef.current.panTo(driver.position);
          mapInstanceRef.current.setZoom(15);
          openInfoWindowForDriver(driver);
      }
  };
  
  // Initialize map when API is loaded
  useEffect(() => {
    if (isLoaded && !loadError && mapRef.current && !mapInstanceRef.current && (window as any).google?.maps?.Map) {
        const map = new (window as any).google.maps.Map(mapRef.current, {
            center: MAP_CENTER,
            zoom: 13,
            disableDefaultUI: true,
            mapId: 'DEMO_MAP_ID',
            styles: theme === 'dark' ? darkMapStyle : [],
        });
        mapInstanceRef.current = map;
    }
  }, [isLoaded, loadError, theme]);
  
  // Update markers when drivers move or map is ready
  useEffect(() => {
    if (!isLoaded || loadError || !mapInstanceRef.current || !(window as any).google?.maps) return;

    const currentMap = mapInstanceRef.current;
    const activeDrivers = drivers.filter(d => d.status !== 'offline');
    
    // Update existing markers and add new ones
    activeDrivers.forEach(driver => {
        const position = new (window as any).google.maps.LatLng(driver.position.lat, driver.position.lng);
        
        const borderColor = driver.status === 'on_trip' ? '#3b82f6' : 'white';

        if (markersRef.current[driver.id]) {
            // Update existing marker
            markersRef.current[driver.id].position = position;
            // Update border color if status changed
            const content = markersRef.current[driver.id].content as HTMLElement;
            if (content && content.style.borderColor !== borderColor) {
                content.style.borderColor = borderColor;
            }

        } else {
            // Create new marker
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
              const currentDriverData = driversRef.current.find(d => d.id === driver.id);
              if (currentDriverData) {
                  setSelectedDriverId(driver.id);
                  openInfoWindowForDriver(currentDriverData);
              }
            });

            markersRef.current[driver.id] = marker;
        }
    });

    // Remove markers for drivers who went offline
    Object.keys(markersRef.current).forEach(driverIdStr => {
      const driverId = parseInt(driverIdStr, 10);
      if (!activeDrivers.some(d => d.id === driverId)) {
          markersRef.current[driverId].map = null;
          delete markersRef.current[driverId];
          if (selectedDriverId === driverId) {
            setSelectedDriverId(null);
            infoWindowRef.current?.close();
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

  return (
    <div className="h-full flex flex-col md:flex-row gap-4">
        {/* Driver List Panel */}
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-slate-800 rounded-xl shadow-md flex flex-col dark:border dark:border-slate-700 max-h-[40vh] md:max-h-full">
            <h2 className="text-xl font-semibold p-4 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">Motoristas Ativos</h2>
            <ul className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <li className="p-4 text-center text-slate-500 dark:text-slate-400">Carregando...</li>
                ) : drivers.filter(d => d.status !== 'offline').length > 0 ? (
                    drivers.filter(d => d.status !== 'offline').map(driver => (
                        <li key={driver.id}>
                            <button
                                onClick={() => handleDriverSelect(driver.id)}
                                className={`w-full flex items-center p-3 text-left rounded-lg transition-colors duration-150 ${
                                    selectedDriverId === driver.id 
                                    ? 'bg-blue-100 dark:bg-slate-700'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                }`}
                            >
                                <img src={driver.avatarUrl || `https://robohash.org/${driver.name}.png?size=50x50`} alt={driver.name} className="w-10 h-10 rounded-full mr-3 border-2 border-slate-200 dark:border-slate-600" />
                                <div>
                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{driver.name}</p>
                                    <DriverStatusIndicator status={driver.status} />
                                </div>
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-slate-500 dark:text-slate-400">Nenhum motorista ativo.</li>
                )}
            </ul>
        </aside>

        {/* Map Area */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-800 rounded-xl shadow-md relative overflow-hidden dark:border dark:border-slate-700">
            <div ref={mapRef} className="w-full h-full" />
            
            {!isLoaded && !loadError && <div className="absolute inset-0 flex items-center justify-center bg-slate-200 dark:bg-slate-800"><p>Carregando Mapa...</p></div>}
            {loadError && <MapErrorOverlay message={loadError.message} />}

            <div className="absolute top-4 right-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg text-sm space-y-2">
                <h3 className="font-bold">Legenda</h3>
                <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-300 dark:bg-slate-600" />
                    <span>Online</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 rounded-full flex items-center justify-center border-2 border-blue-500 dark:border-blue-400 overflow-hidden bg-slate-300 dark:bg-slate-600" />
                    <span>Em Viagem</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                <button onClick={handleZoomIn} aria-label="Aproximar" className="w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057b8]">
                    +
                </button>
                <button onClick={handleZoomOut} aria-label="Afastar" className="w-10 h-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md shadow-lg flex items-center justify-center text-slate-800 dark:text-slate-200 font-bold text-2xl hover:bg-white dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#0057b8]">
                    -
                </button>
            </div>
        </div>
    </div>
  );
};

export default MapView;