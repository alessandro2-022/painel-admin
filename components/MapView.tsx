import React, { useState, useEffect, useRef } from 'react';
import { Driver } from '../types';
import useGoogleMaps from '../hooks/useGoogleMaps';
import { useTheme } from '../hooks/useTheme';
import darkMapStyle from '../styles/darkMapStyle';
import MapErrorOverlay from './MapErrorOverlay';
import { MOCK_DRIVERS } from '../constants';

// Center of our map (São Paulo) and boundaries for simulation
const MAP_CENTER = { lat: -23.555, lng: -46.64 };
const BOUNDS = {
  north: MAP_CENTER.lat + 0.05,
  south: MAP_CENTER.lat - 0.05,
  east: MAP_CENTER.lng + 0.05,
  west: MAP_CENTER.lng - 0.05,
};

// Custom type for internal state management, extending Driver with velocity
type MovingDriver = Driver & {
  velocity: {
    vLat: number;
    vLng: number;
  };
};

const MapView: React.FC = () => {
  const [drivers, setDrivers] = useState<MovingDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const [theme] = useTheme();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markersRef = useRef<{[key: number]: any}>({});
  const infoWindowRef = useRef<any | null>(null);

  // Keep a ref to the latest drivers data to avoid stale closures in event listeners
  const driversRef = useRef(drivers);
  useEffect(() => {
    driversRef.current = drivers;
  }, [drivers]);

  // Simula o carregamento de dados de uma API
  useEffect(() => {
    // Em um app real, aqui seria feita uma chamada fetch ou aberta uma conexão WebSocket
    setTimeout(() => {
        // Preenche com dados mockados para demonstração
        setDrivers(MOCK_DRIVERS.map(d => ({ ...d, velocity: { vLat: (Math.random() - 0.5) * 0.0001, vLng: (Math.random() - 0.5) * 0.0001 }})));
        setIsLoading(false);
    }, 1500);
  }, []);

  // Enhanced effect to simulate more realistic real-time data updates
  useEffect(() => {
    if (drivers.length === 0) return;

    const simulationInterval = setInterval(() => {
      setDrivers(prevDrivers =>
        prevDrivers.map(driver => {
          if (driver.online) {
            let newLat = driver.position.lat + driver.velocity.vLat;
            let newLng = driver.position.lng + driver.velocity.vLng;
            let { vLat, vLng } = driver.velocity;

            // Reverse direction if a driver hits the predefined boundaries
            if (newLat > BOUNDS.north || newLat < BOUNDS.south) {
              vLat = -vLat;
              newLat = driver.position.lat + vLat;
            }
            if (newLng > BOUNDS.east || newLng < BOUNDS.west) {
              vLng = -vLng;
              newLng = driver.position.lng + vLng;
            }

            // Introduce a small chance to randomly change direction for more natural movement
            if (Math.random() < 0.05) { // 5% chance per update
              vLat = (Math.random() - 0.5) * 0.0001;
              vLng = (Math.random() - 0.5) * 0.0001;
            }

            return {
              ...driver,
              position: { lat: newLat, lng: newLng },
              velocity: { vLat, vLng },
            };
          }
          return driver;
        })
      );
    }, 1500); // Update interval set to 1.5 seconds for smoother, more frequent updates

    return () => clearInterval(simulationInterval);
  }, [drivers.length]); // Reinicia a simulação se a lista de motoristas mudar

  const openInfoWindowForDriver = (driver: Driver) => {
      if (!mapInstanceRef.current || !markersRef.current[driver.id] || !(window as any).google?.maps) return;
      
      const currentMap = mapInstanceRef.current;
      const marker = markersRef.current[driver.id];
      
      if (!infoWindowRef.current) {
          infoWindowRef.current = new (window as any).google.maps.InfoWindow();
      }

      const contentString = `
        <div class="p-1 font-sans">
          <h3 class="font-bold text-md text-slate-800">${driver.name}</h3>
          <p class="text-sm text-slate-600">Status: <span class="font-semibold text-green-600">Online</span></p>
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
    const onlineDrivers = drivers.filter(d => d.online);
    
    // Update existing markers and add new ones
    onlineDrivers.forEach(driver => {
        const position = new (window as any).google.maps.LatLng(driver.position.lat, driver.position.lng);
        
        if (markersRef.current[driver.id]) {
            // Update existing marker
            markersRef.current[driver.id].position = position;
        } else {
            // Create new marker
            const img = document.createElement('img');
            img.src = driver.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0iI2ZmZDcwMCI+PHBhdGggZD0iTTEwLjg5NCAyLjU1M2ExIDEgMCAwMC0xLjc4OCAwbadgesS0xNGExIDEgMCAwMDEuMTY5IDEuNDA5bDUgMS40MjlBMSAxIDAgMDA5IDE1LjU3MVYxMWExIDEgMCAxMTIgMHY0LjU3MWExIDEgMCAwMC43MjUuOTYybDUgMS40MjhhMSAxIDAgMDAxLjE3LTEuNDA4bC03LTE0eiIgLz48L3N2Zz4='; // Default icon
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.borderRadius = '50%';
            img.style.border = '2px solid white';
            img.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
            img.style.cursor = 'pointer';

            const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
                position,
                map: currentMap,
                content: img,
                title: driver.name,
            });

            // Add click listener to open InfoWindow
            img.addEventListener('click', () => {
              const currentDriverData = driversRef.current.find(d => d.id === driver.id);
              if (currentDriverData) {
                  setSelectedDriverId(driver.id); // Sync selection
                  openInfoWindowForDriver(currentDriverData);
              }
            });

            markersRef.current[driver.id] = marker;
        }
    });

    // Remove markers for drivers who went offline
    Object.keys(markersRef.current).forEach(driverIdStr => {
      const driverId = parseInt(driverIdStr, 10);
      if (!onlineDrivers.some(d => d.id === driverId)) {
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
            <h2 className="text-xl font-semibold p-4 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100">Motoristas Online</h2>
            <ul className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                    <li className="p-4 text-center text-slate-500 dark:text-slate-400">Carregando...</li>
                ) : drivers.filter(d => d.online).length > 0 ? (
                    drivers.filter(d => d.online).map(driver => (
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
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
                                </div>
                            </button>
                        </li>
                    ))
                ) : (
                    <li className="p-4 text-center text-slate-500 dark:text-slate-400">Nenhum motorista online.</li>
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
                    <div className="h-5 w-5 rounded-full flex items-center justify-center border border-white dark:border-slate-800 overflow-hidden bg-slate-300 dark:bg-slate-600">
                        <img src="https://robohash.org/driver.png?size=50x50" alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                    <span>Motorista (Avatar)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="h-5 w-5 bg-[#ffd700] rounded-full border border-white dark:border-slate-800 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-800 dark:text-slate-900" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    </div>
                    <span>Motorista (Padrão)</span>
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