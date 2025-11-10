import { Driver, Promotion, User, DriverProfile, Ride, RideStatus } from '../types';

// --- MOCK DATABASE ---

let mockDrivers: Driver[] = [
  { id: 1, name: 'João Silva', avatarUrl: 'https://i.pravatar.cc/150?u=joao', status: 'online', position: { lat: -23.55, lng: -46.63 } },
  { id: 2, name: 'Maria Oliveira', avatarUrl: 'https://i.pravatar.cc/150?u=maria', status: 'on_trip', position: { lat: -23.56, lng: -46.65 } },
  { id: 3, name: 'Carlos Pereira', avatarUrl: 'https://i.pravatar.cc/150?u=carlos', status: 'online', position: { lat: -23.54, lng: -46.64 } },
  { id: 4, name: 'Ana Costa', avatarUrl: 'https://i.pravatar.cc/150?u=ana', status: 'offline', position: { lat: -23.57, lng: -46.66 } },
];

let mockPromotions: Promotion[] = [
    {
      id: 'promo1',
      code: 'GOLYVERAO24',
      discount: 15,
      target: 'user',
      isActive: true,
      createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
      updatedAt: new Date('2024-07-21T11:30:00Z').toISOString(),
      history: [
        { date: new Date('2024-07-21T11:30:00Z').toISOString(), change: 'Status alterado para Ativo.' },
        { date: new Date('2024-07-20T10:00:00Z').toISOString(), change: 'Promoção criada.' },
      ],
    },
    {
      id: 'promo2',
      code: 'MOTORISTA10',
      discount: 10,
      target: 'driver',
      isActive: false,
      createdAt: new Date('2024-07-15T14:00:00Z').toISOString(),
      updatedAt: new Date('2024-07-22T09:00:00Z').toISOString(),
      history: [
        { date: new Date('2024-07-22T09:00:00Z').toISOString(), change: 'Status alterado para Inativo.' },
        { date: new Date('2024-07-15T14:00:00Z').toISOString(), change: 'Promoção criada.' },
      ],
    }
];

let mockUsers: User[] = [
    { id: 1, name: 'Admin Goly', email: 'admin@goly.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=admin@goly.com' },
    { id: 2, name: 'Operador Goly', email: 'op@goly.com', role: 'operator', avatarUrl: 'https://i.pravatar.cc/150?u=op@goly.com' },
];

const mockDriverProfiles: Record<number, DriverProfile> = {
    3: { id: 3, name: 'Carlos Pereira', avatarUrl: 'https://i.pravatar.cc/150?u=carlos', vehicle: { model: 'Honda Civic', licensePlate: 'XYZ-1234' }, rating: 4.9 }
};

let mockRides: Ride[] = [
    { id: 'ride1', passengerName: 'Fernanda', passengerAvatarUrl: '', pickupLocation: 'Av. Paulista, 1000', dropoffLocation: 'R. Augusta, 500', fare: 25.50, etaMinutes: 5, status: 'completed', createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
];

// --- API SIMULATION ---

const simulateApiCall = <T>(data: T, delay = 500): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), delay));

// --- API FUNCTIONS ---

export const getDrivers = (): Promise<Driver[]> => simulateApiCall(mockDrivers);

export const getDashboardStats = (timeFilter: 'week' | 'month' | 'year'): Promise<{ totalRides: number; totalRevenue: number; completedToday: number; }> => {
    // Mock data based on filter
    const multipliers = { week: 1, month: 4, year: 52 };
    return simulateApiCall({
        totalRides: 425 * multipliers[timeFilter],
        totalRevenue: 8500 * multipliers[timeFilter],
        completedToday: 55,
    });
};

export const subscribeToDriverLocationUpdates = (callback: (updatedDrivers: Driver[]) => void): (() => void) => {
    const interval = setInterval(() => {
        mockDrivers = mockDrivers.map(driver => {
            if (driver.status !== 'offline') {
                return {
                    ...driver,
                    position: {
                        lat: driver.position.lat + (Math.random() - 0.5) * 0.001,
                        lng: driver.position.lng + (Math.random() - 0.5) * 0.001,
                    }
                };
            }
            return driver;
        });
        callback(mockDrivers);
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval); // Unsubscribe function
};

export const getPromotions = (): Promise<Promotion[]> => simulateApiCall(mockPromotions);

export const createPromotion = (data: Omit<Promotion, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Promotion> => {
    const newPromo: Promotion = {
        ...data,
        id: `promo${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), change: 'Promoção criada.' }],
    };
    mockPromotions.push(newPromo);
    return simulateApiCall(newPromo);
};

export const updatePromotion = (id: string, data: Partial<Omit<Promotion, 'id'>>): Promise<Promotion> => {
    const promoIndex = mockPromotions.findIndex(p => p.id === id);
    if (promoIndex > -1) {
        mockPromotions[promoIndex] = { ...mockPromotions[promoIndex], ...data, updatedAt: new Date().toISOString() };
        mockPromotions[promoIndex].history.unshift({ date: new Date().toISOString(), change: 'Detalhes da promoção atualizados.' });
        return simulateApiCall(mockPromotions[promoIndex]);
    }
    return Promise.reject('Promotion not found');
};

export const togglePromotionStatus = (id: string): Promise<Promotion> => {
    const promoIndex = mockPromotions.findIndex(p => p.id === id);
    if (promoIndex > -1) {
        const promo = mockPromotions[promoIndex];
        promo.isActive = !promo.isActive;
        promo.updatedAt = new Date().toISOString();
        promo.history.unshift({ date: promo.updatedAt, change: `Status alterado para ${promo.isActive ? 'Ativo' : 'Inativo'}.` });
        return simulateApiCall(promo);
    }
    return Promise.reject('Promotion not found');
};

export const getDriverProfile = (driverId: number): Promise<DriverProfile> => {
    const profile = mockDriverProfiles[driverId];
    if (profile) return simulateApiCall(profile);
    return Promise.reject('Profile not found');
};

export const setDriverOnlineStatus = (driverId: number, isOnline: boolean): Promise<{ success: true }> => {
    const driver = mockDrivers.find(d => d.id === driverId);
    if (driver) {
        driver.status = isOnline ? 'online' : 'offline';
    }
    return simulateApiCall({ success: true });
};

// Mock WebSocket for ride requests
export const listenForRideRequests = (driverId: number, callback: (ride: Ride) => void): (() => void) => {
    const interval = setInterval(() => {
        // Simulate a new ride request for this driver
        const newRide: Ride = {
            id: `ride_${Date.now()}`,
            passengerName: 'Ana Beatriz',
            passengerAvatarUrl: 'https://i.pravatar.cc/150?u=anabeatriz',
            pickupLocation: 'Shopping Eldorado',
            dropoffLocation: 'Parque Ibirapuera',
            fare: 32.80,
            etaMinutes: 6,
            status: 'request',
            createdAt: new Date().toISOString(),
        };
        console.log(`Simulating ride request for driver ${driverId}`);
        callback(newRide);
    }, 20000); // New ride request every 20 seconds
    
    return () => clearInterval(interval);
};

export const updateRideStatus = (rideId: string, newStatus: RideStatus): Promise<Ride> => {
     const ride = mockRides.find(r => r.id === rideId);
     if(ride) {
         ride.status = newStatus;
         if(newStatus === 'completed') ride.completedAt = new Date().toISOString();
         return simulateApiCall(ride);
     }
     // If it's a new ride, add it to the list
     const newRideData = {
        id: rideId,
        passengerName: 'Ana Beatriz',
        passengerAvatarUrl: 'https://i.pravatar.cc/150?u=anabeatriz',
        pickupLocation: 'Shopping Eldorado',
        dropoffLocation: 'Parque Ibirapuera',
        fare: 32.80,
        etaMinutes: 6,
        status: newStatus,
        createdAt: new Date().toISOString(),
     };
     mockRides.push(newRideData);
     return simulateApiCall(newRideData);
};

export const getDriverEarnings = (driverId: number): Promise<{ recentRides: Ride[], totalToday: number }> => {
    const completedRides = mockRides.filter(r => r.status === 'completed');
    const total = completedRides.reduce((sum, ride) => sum + ride.fare, 0);
    return simulateApiCall({
        recentRides: completedRides,
        totalToday: total,
    });
};
