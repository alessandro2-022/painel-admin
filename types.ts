export type DriverStatus = 'online' | 'on_trip' | 'offline';

export interface Driver {
  id: number;
  name: string;
  avatarUrl?: string;
  status: DriverStatus;
  position: {
    lat: number;
    lng: number;
  };
}

export interface Promotion {
  id: string;
  code: string;
  discount: number;
  target: 'user' | 'driver';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  history: PromotionHistoryEntry[];
}

export interface PromotionHistoryEntry {
  date: string;
  change: string;
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
  totalDistance: number;
  totalDuration: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator';
  avatarUrl: string;
}

// Driver App specific types
export type DriverView = 'home' | 'earnings' | 'support';

export interface DriverProfile {
  id: number;
  name: string;
  avatarUrl: string;
  vehicle: {
    model: string;
    licensePlate: string;
  };
  rating: number;
}

export type RideStatus = 'request' | 'en_route_to_pickup' | 'at_pickup' | 'en_route_to_destination' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  passengerName: string;
  passengerAvatarUrl: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  etaMinutes: number; // ETA for driver to reach pickup
  status: RideStatus;
  createdAt: string;
  completedAt?: string;
}

// A Ride during the 'request' status phase has more specific info
export type RideRequest = Ride & { status: 'request' };
