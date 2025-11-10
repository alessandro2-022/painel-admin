import { Driver, User, Promotion } from '../types.ts';
import { getWebsocketService } from './websocketService.ts';

// --- MOCK DATABASE ---
let users: User[] = [
    { id: 1, name: 'Alice Admin', email: 'alice@goly.com', role: 'admin', avatarUrl: `https://i.pravatar.cc/150?u=user1` },
    { id: 2, name: 'Bob Operator', email: 'bob@goly.com', role: 'operator', avatarUrl: `https://i.pravatar.cc/150?u=user2` },
];

let drivers: Driver[] = [
  { id: 3, name: 'Carlos Motorista', avatarUrl: `https://i.pravatar.cc/150?u=driver3`, status: 'online', position: { lat: -23.55, lng: -46.63 }, registeredAt: '2023-01-15T10:00:00Z' },
  { id: 4, name: 'Daniela Silva', avatarUrl: `https://i.pravatar.cc/150?u=driver4`, status: 'on_trip', position: { lat: -23.56, lng: -46.65 }, registeredAt: '2023-02-20T11:30:00Z' },
  { id: 5, name: 'Eduardo Costa', avatarUrl: `https://i.pravatar.cc/150?u=driver5`, status: 'offline', position: { lat: -23.54, lng: -46.64 }, registeredAt: '2023-03-10T09:00:00Z' },
  { id: 6, name: 'Fernanda Lima', avatarUrl: `https://i.pravatar.cc/150?u=driver6`, status: 'online', position: { lat: -23.57, lng: -46.62 }, registeredAt: '2023-04-05T14:00:00Z' },
];

let promotions: Promotion[] = [
    { id: 'promo1', code: 'GOLYVERAO24', discount: 15, target: 'user', isActive: true, createdAt: '2024-01-01T12:00:00Z', updatedAt: '2024-01-01T12:00:00Z', history: [{date: '2024-01-01T12:00:00Z', change: 'Promoção criada.'}] },
    { id: 'promo2', code: 'MOTORISTASHOW', discount: 10, target: 'driver', isActive: false, createdAt: '2024-02-15T10:00:00Z', updatedAt: '2024-03-01T10:00:00Z', history: [{date: '2024-02-15T10:00:00Z', change: 'Promoção criada.'}, {date: '2024-03-01T10:00:00Z', change: 'Promoção desativada.'}] },
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API FUNCTIONS ---

// Dashboard
export const getDashboardStats = async (filter: 'week' | 'month' | 'year') => {
    await sleep(500);
    return {
        totalRides: filter === 'week' ? 120 : (filter === 'month' ? 480 : 5000),
        totalRevenue: filter === 'week' ? 3000.50 : (filter === 'month' ? 12000.25 : 150000.75),
        completedToday: 15,
    };
};

// Drivers & Map
export const getDrivers = async (): Promise<Driver[]> => {
    await sleep(500);
    return JSON.parse(JSON.stringify(drivers)); // Deep copy to avoid mutation
};

export const subscribeToDriverLocationUpdates = (callback: (updatedDrivers: Driver[]) => void): (() => void) => {
    const websocketService = getWebsocketService(); // Get singleton instance
    const interval = setInterval(() => {
        drivers.forEach(driver => {
            if (driver.status !== 'offline') {
                driver.position.lat += (Math.random() - 0.5) * 0.001;
                driver.position.lng += (Math.random() - 0.5) * 0.001;
            }
        });
        websocketService.emit('driverLocationUpdate', drivers);
    }, 3000);

    const handleUpdate = (data: any) => {
        // Assuming the websocket message for this is a direct payload of drivers
         callback(data);
    };
    websocketService.on('driverLocationUpdate', handleUpdate);

    // Initial emit for immediate data
    callback(drivers);

    return () => {
        clearInterval(interval);
        websocketService.off('driverLocationUpdate', handleUpdate);
    };
};

// Promotions
export const getPromotions = async (): Promise<Promotion[]> => {
    await sleep(700);
    return JSON.parse(JSON.stringify(promotions));
};

export const createPromotion = async (data: Omit<Promotion, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Promotion> => {
    await sleep(500);
    const newPromo: Promotion = {
        ...data,
        id: `promo${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        history: [{ date: new Date().toISOString(), change: 'Promoção criada.' }],
    };
    promotions.push(newPromo);
    return newPromo;
};

export const updatePromotion = async (id: string, data: Partial<Omit<Promotion, 'id'>>): Promise<Promotion> => {
    await sleep(500);
    const promo = promotions.find(p => p.id === id);
    if (!promo) throw new Error('Promotion not found');
    Object.assign(promo, data);
    promo.updatedAt = new Date().toISOString();
    promo.history.push({ date: new Date().toISOString(), change: `Detalhes da promoção atualizados.` });
    return promo;
};

export const togglePromotionStatus = async (id: string): Promise<Promotion> => {
    await sleep(300);
    const promo = promotions.find(p => p.id === id);
    if (!promo) throw new Error('Promotion not found');
    promo.isActive = !promo.isActive;
    promo.updatedAt = new Date().toISOString();
    promo.history.push({ date: new Date().toISOString(), change: `Status alterado para ${promo.isActive ? 'ativo' : 'inativo'}.` });
    return promo;
};


// Users
export const getUsers = async (): Promise<User[]> => {
    await sleep(600);
    return JSON.parse(JSON.stringify(users));
};

export const createUser = async (data: Omit<User, 'id' | 'avatarUrl'>): Promise<User> => {
    await sleep(500);
    const newUser: User = {
        ...data,
        id: Math.max(...users.map(u => u.id), 0) + 1,
        avatarUrl: `https://i.pravatar.cc/150?u=user${Date.now()}`,
    };
    users.push(newUser);
    return newUser;
};

export const deleteUser = async (id: number): Promise<void> => {
    await sleep(500);
    users = users.filter(u => u.id !== id);
};