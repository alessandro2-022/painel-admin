export type View = 'dashboard' | 'map' | 'fares' | 'promotions' | 'support' | 'live' | 'routeOptimization';

export interface Driver {
  id: number;
  name: string;
  online: boolean;
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
    id: string;
    name: string;
    avatarUrl: string;
}

export interface RideRequest {
    id: string;
    pickupLocation: string;
    dropoffLocation: string;
    fare: number;
    etaMinutes: number;
}