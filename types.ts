export type DriverStatus = 'online' | 'on_trip' | 'offline';

export type View = 'dashboard' | 'map' | 'routes' | 'fares' | 'promotions' | 'drivers' | 'users' | 'support' | 'live-assistant';

export interface Position {
  lat: number;
  lng: number;
}

export interface Driver {
  id: number;
  name: string;
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