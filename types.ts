export type View = 'dashboard' | 'map' | 'fares' | 'promotions' | 'support' | 'routeOptimization';

export type DriverStatus = 'online' | 'offline' | 'on_trip';

export interface Driver {
  id: number;
  name: string;
  status: DriverStatus;
  position: {
    lat: number;
    lng: number;
  };
  avatarUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: GroundingSource[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface Stop {
  id: number;
  address: string;
  lat: number;
  lng: number;
}

export interface OptimizedRoute {
  stops: Stop[];
  totalDistance: number;
  totalDuration: number;
}

export interface PromotionHistory {
  date: string;
  change: string;
}

export interface Promotion {
  id: string;
  code: string;
  discount: number; // Percentage
  target: 'user' | 'driver';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  history: PromotionHistory[];
}


// --- Tipos do Aplicativo de Motorista ---

export type DriverView = 'home' | 'earnings' | 'support';

export interface DriverProfile {
    id: number;
    name: string;
    avatarUrl: string;
}

// Representa o ciclo de vida completo de uma corrida
export type RideStatus = 'request' | 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_destination' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  etaMinutes: number; // ETA do motorista até o ponto de embarque
  status: RideStatus;
  driverId: number;
  completedAt?: string;
}

// O que o motorista vê inicialmente. É um subconjunto da corrida completa.
export type RideRequest = Omit<Ride, 'status' | 'driverId'>;