

export type DriverStatus = 'online' | 'on_trip' | 'offline';

export type View = 'dashboard' | 'map' | 'routes' | 'fares' | 'promotions' | 'drivers' | 'users' | 'support' | 'region-management' | 'financial-reports' | 'rides-management' | 'customer-support';

export interface Position {
  lat: number;
  lng: number;
}

export interface Driver {
  id: number;
  name: string;
  email: string; 
  phone?: string; 
  vehicleModel?: string; 
  licensePlate?: string; 
  avatarUrl: string;
  status: DriverStatus;
  position: Position;
  registeredAt: string;
}

export type UserRole = 'admin' | 'operator';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string;
}

export interface PromotionHistory {
    date: string;
    change: string;
}

export interface Promotion {
    id: string;
    code: string;
    discount: number;
    target: 'user' | 'driver';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    history: PromotionHistory[];
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    sources?: GroundingSource[];
}

export interface Stop {
    id: number;
    address: string;
    lat: number;
    lng: number;
}

export interface OptimizedRoute {
    stops: Stop[];
    totalDistance: number; // in km
    totalDuration: number; // in minutes
}

// For Gemini Maps Grounding
export interface LatLng {
    latitude: number;
    longitude: number;
}

export type GeolocationStatus = 'idle' | 'loading' | 'available' | 'denied' | 'error';

// For Mapbox SharedMap component
export interface SharedMapMarker {
    id: number | string; // Allow string IDs for generic markers
    lat: number;
    lng: number;
    avatarUrl?: string; // For drivers
    status?: DriverStatus; // For drivers
    name?: string; // Added to display driver name on map markers
    // Add any other properties here that you might need to display or style a marker
}

export interface SharedMapRoute {
    coordinates: [number, number][]; // Array of [longitude, latitude] pairs for a LineString
}