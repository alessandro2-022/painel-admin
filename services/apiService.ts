import { Driver, Promotion, Ride, RideStatus, DriverProfile } from '../types';

// --- Configuração da API ---
// Detecta se a aplicação está rodando em um ambiente de desenvolvimento local (ex: localhost).
// Isso permite alternar entre um endpoint de API local e um relativo para produção.
const IS_LOCAL_DEVELOPMENT = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// O URL base para sua API de backend.
const API_BASE_URL = IS_LOCAL_DEVELOPMENT ? 'http://localhost:8080/api' : '/api';

// O URL para o servidor WebSocket.
const WEBSOCKET_URL = IS_LOCAL_DEVELOPMENT
    ? 'ws://localhost:8080/ws'
    : window.location.origin.replace(/^http/, 'ws') + '/ws';


// --- Funções de API Genéricas ---

// Função auxiliar para lidar com respostas da API e erros de rede
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro HTTP: ${response.status}`;
        if (errorText) {
            try {
                // Tenta analisar como JSON para obter uma mensagem de erro estruturada
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorText;
            } catch (e) {
                // Se não for JSON, o texto bruto é a melhor mensagem de erro
                errorMessage = errorText;
            }
        }
        throw new Error(errorMessage);
    }

    const responseText = await response.text();
    if (!responseText) {
        // Lida com respostas de sucesso sem conteúdo (ex: 204 No Content)
        return {} as T;
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        console.error("Falha ao analisar JSON de uma resposta bem-sucedida:", responseText);
        throw new Error("A resposta do servidor não está no formato JSON esperado.");
    }
}

// --- Funções da API de Motoristas e Painel ---

export const getDrivers = (): Promise<Driver[]> => {
    return fetch(`${API_BASE_URL}/drivers`).then(handleResponse<Driver[]>);
};

export const getDriverProfile = (driverId: number): Promise<DriverProfile> => {
    // Em um app real, você teria um endpoint para buscar o perfil do motorista logado.
    // Aqui, estamos buscando um motorista específico para a demonstração.
    return fetch(`${API_BASE_URL}/drivers/${driverId}/profile`).then(handleResponse<DriverProfile>);
}

export const setDriverOnlineStatus = (driverId: number, isOnline: boolean): Promise<Driver> => {
    return fetch(`${API_BASE_URL}/drivers/${driverId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline }),
    }).then(handleResponse<Driver>);
}

export const getDashboardStats = (timeFilter: 'week' | 'month' | 'year'): Promise<{ totalRides: number; totalRevenue: number; completedToday: number; }> => {
    // FIX: Explicitly provided the generic type to `handleResponse` to resolve the type error.
    return fetch(`${API_BASE_URL}/dashboard/stats?filter=${timeFilter}`).then(handleResponse<{ totalRides: number; totalRevenue: number; completedToday: number; }>);
};

export const getDriverEarnings = (driverId: number): Promise<{ recentRides: Ride[]; totalToday: number; }> => {
    // FIX: Explicitly provided the generic type to `handleResponse` to resolve the type error.
    // FIX: Corrigido erro de digitação de API_BADE_URL para API_BASE_URL.
    return fetch(`${API_BASE_URL}/drivers/${driverId}/earnings`).then(handleResponse<{ recentRides: Ride[]; totalToday: number; }>);
}


// --- Funções de API de Promoções ---

export const getPromotions = (): Promise<Promotion[]> => {
    return fetch(`${API_BASE_URL}/promotions`).then(handleResponse<Promotion[]>);
};

export const createPromotion = (newData: Omit<Promotion, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'history'>): Promise<Promotion> => {
    return fetch(`${API_BASE_URL}/promotions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
    }).then(handleResponse<Promotion>);
};

export const updatePromotion = (promoId: string, updatedData: Partial<Omit<Promotion, 'id' | 'isActive' | 'createdAt' | 'updatedAt' | 'history'>>): Promise<Promotion> => {
    return fetch(`${API_BASE_URL}/promotions/${promoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
    }).then(handleResponse<Promotion>);
};

export const togglePromotionStatus = (promoId: string): Promise<Promotion> => {
    return fetch(`${API_BASE_URL}/promotions/${promoId}/toggle`, {
        method: 'PATCH',
    }).then(handleResponse<Promotion>);
};


// --- ESTRUTURA PARA TEMPO REAL (WebSockets) ---

let socket: WebSocket | null = null;
let isConnecting = false;
let reconnectTimeout: number | undefined;
let reconnectDelay = 1000; // Começa com 1 segundo
const MAX_RECONNECT_DELAY = 30000; // Atraso máximo de 30 segundos

// Função auxiliar para agendar a reconexão com atraso exponencial
const scheduleReconnect = () => {
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
    }
    console.log(`Tentando reconectar o WebSocket em ${(reconnectDelay / 1000).toFixed(1)}s...`);
    reconnectTimeout = setTimeout(connectWebSocket, reconnectDelay);
    // Aumenta o atraso para a próxima tentativa
    reconnectDelay = Math.min(reconnectDelay * 2, MAX_RECONNECT_DELAY);
};

export function connectWebSocket() {
    // Limpa o timeout agendado, já que estamos tentando conectar agora.
    if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = undefined;
    }

    // Evita múltiplas conexões se já estiver conectado ou conectando.
    if ((socket && (socket.readyState === WebSocket.CONNECTING || socket.readyState === WebSocket.OPEN)) || isConnecting) {
        return;
    }
    
    isConnecting = true;

    try {
        socket = new WebSocket(WEBSOCKET_URL);

        socket.onopen = () => {
            console.log('Conectado ao servidor WebSocket.');
            isConnecting = false;
            // Reseta o atraso de reconexão em caso de sucesso
            reconnectDelay = 1000;
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                
                // Dispara eventos personalizados para diferentes partes do aplicativo ouvirem
                switch (message.type) {
                    case 'driver-location-update':
                        window.dispatchEvent(new CustomEvent('driver-update', { detail: message.payload }));
                        break;
                    case 'new-ride-request':
                        window.dispatchEvent(new CustomEvent('ride-request', { detail: message.payload }));
                        break;
                    // Adicione outros tipos de mensagem conforme necessário
                }
            } catch (e) {
                console.error('Erro ao processar mensagem do WebSocket:', e);
            }
        };

        socket.onerror = (event: Event) => {
            // O evento de erro do WebSocket é genérico. O motivo exato geralmente é
            // registrado no console do navegador e o evento 'onclose' é acionado em seguida
            // com um código de status. Este log ajuda a confirmar a URL de destino.
            console.error(`Ocorreu um erro na conexão WebSocket com ${WEBSOCKET_URL}. Verifique o console para mais detalhes.`);
            isConnecting = false;
        };

        socket.onclose = (event: CloseEvent) => {
            console.log(`Desconectado do servidor WebSocket. Código: ${event.code}, Motivo: '${event.reason || 'Nenhum motivo especificado'}.'`);
            socket = null;
            isConnecting = false;
            scheduleReconnect(); // Usa a nova função para agendar a reconexão
        };
    } catch (error) {
        console.error("Falha ao criar WebSocket:", error);
        isConnecting = false;
        scheduleReconnect(); // Usa a nova função para agendar a reconexão
    }
}


// As funções que os componentes usarão para interagir com o WebSocket

export const subscribeToDriverLocationUpdates = (callback: (updatedDrivers: Driver[]) => void): (() => void) => {
    const handler = (event: Event) => {
        callback((event as CustomEvent).detail);
    };
    window.addEventListener('driver-update', handler);

    // Retorna uma função de limpeza para remover o ouvinte
    return () => window.removeEventListener('driver-update', handler);
};

export const listenForRideRequests = (driverId: number, onRideRequest: (ride: Ride) => void): (() => void) => {
    const handler = (event: Event) => {
        const ride = (event as CustomEvent).detail as Ride;
        // O backend deve enviar a corrida apenas para o motorista relevante
        if (ride.driverId === driverId) {
            onRideRequest(ride);
        }
    };
    window.addEventListener('ride-request', handler);

    return () => window.removeEventListener('ride-request', handler);
};

export const updateRideStatus = (rideId: string, status: RideStatus): Promise<Ride | null> => {
    // Em um sistema real, você enviaria esta atualização via WebSocket ou uma chamada de API
    // e o backend confirmaria a mudança.
    return new Promise((resolve) => {
        if(socket && socket.readyState === 1) { // 1 === OPEN
            socket.send(JSON.stringify({
                type: 'update-ride-status',
                payload: { rideId, status }
            }));
            // Aqui, o ideal seria o backend responder com a corrida atualizada via WebSocket,
            // que seria capturada por um ouvinte. Para simplificar, estamos resolvendo otimisticamente.
            // Para uma implementação robusta, um sistema de request/response sobre WebSocket seria melhor.
             resolve(null); // A atualização virá do backend via WebSocket.
        } else {
             // Fallback para API
             fetch(`${API_BASE_URL}/rides/${rideId}/status`, {
                 method: 'PUT',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ status }),
             }).then(res => handleResponse<Ride>(res).then(resolve));
        }
    });
};