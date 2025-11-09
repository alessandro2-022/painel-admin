import { Driver, Promotion } from './types';

export const MOCK_DRIVERS: Driver[] = [
  { id: 1, name: 'João Silva', online: true, position: { lat: -23.5505, lng: -46.6333 }, avatarUrl: 'https://robohash.org/joao.png?size=50x50' },
  { id: 2, name: 'Maria Santos', online: true, position: { lat: -23.5613, lng: -46.6565 }, avatarUrl: 'https://robohash.org/maria.png?size=50x50' },
  { id: 3, name: 'Carlos Pereira', online: false, position: { lat: -23.5475, lng: -46.6361 } },
  { id: 4, name: 'Ana Oliveira', online: true, position: { lat: -23.5582, lng: -46.6234 }, avatarUrl: 'https://robohash.org/ana.png?size=50x50' },
  { id: 5, name: 'Pedro Costa', online: true, position: { lat: -23.5499, lng: -46.6499 } }, // Fallback to default icon
  { id: 6, name: 'Sofia Ferreira', online: false, position: { lat: -23.5678, lng: -46.6312 }, avatarUrl: 'https://robohash.org/sofia.png?size=50x50' },
];

export const MOCK_PROMOTIONS: Promotion[] = [
  { 
    id: 'promo-1', 
    code: 'GOLYVERAO24', 
    discount: 15, 
    target: 'user', 
    isActive: true, 
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-06-15T14:30:00Z',
    history: [
      { date: '2024-06-15T14:30:00Z', change: 'Desconto alterado de 10% para 15%.' },
      { date: '2024-01-10T10:00:00Z', change: 'Promoção criada.' },
    ]
  },
  { 
    id: 'promo-2', 
    code: 'NOVOMOTORISTA', 
    discount: 5, 
    target: 'driver', 
    isActive: true,
    createdAt: '2024-02-20T09:00:00Z',
    updatedAt: '2024-02-20T09:00:00Z',
    history: [
      { date: '2024-02-20T09:00:00Z', change: 'Promoção criada.' },
    ]
  },
  { 
    id: 'promo-3', 
    code: 'FESTAS10', 
    discount: 10, 
    target: 'user', 
    isActive: false,
    createdAt: '2023-12-01T12:00:00Z',
    updatedAt: '2024-01-05T18:00:00Z',
    history: [
      { date: '2024-01-05T18:00:00Z', change: 'Status alterado para Inativo.' },
      { date: '2023-12-01T12:00:00Z', change: 'Promoção criada.' },
    ]
  },
  { 
    id: 'promo-4', 
    code: 'CLIENTEVIP', 
    discount: 20, 
    target: 'user', 
    isActive: true,
    createdAt: '2024-05-01T08:00:00Z',
    updatedAt: '2024-05-01T08:00:00Z',
    history: [
      { date: '2024-05-01T08:00:00Z', change: 'Promoção criada.' },
    ]
  },
];