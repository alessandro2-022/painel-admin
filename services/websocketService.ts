import { WEBSOCKET_URL } from '../constants.ts';
import { connectionStore } from '../stores/connectionStore.ts';

type EventCallback = (data: any) => void;

class WebSocketService {
    private ws: WebSocket | null = null;
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private reconnectAttempts = 0;

    constructor() {
        this.connect();
    }

    public connect(): void {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            return;
        }
        
        connectionStore.setState('connecting');
        this.ws = new WebSocket(WEBSOCKET_URL);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.reconnectAttempts = 0;
            this.emitEvent('open', null);
            connectionStore.setState('connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.emitEvent('message', data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };

        this.ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            this.emitEvent('error', event);
            // O onclose será chamado em seguida, então tratamos a reconexão lá.
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.emitEvent('close', null);
            connectionStore.setState('error', 'Conexão em tempo real perdida. Tentando reconectar...');
            this.handleReconnect();
        };
    }

    private handleReconnect(): void {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff up to 30s
        console.log(`Attempting to reconnect in ${delay / 1000}s...`);
        setTimeout(() => this.connect(), delay);
    }

    public on(eventName: string, callback: EventCallback): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, new Set());
        }
        this.listeners.get(eventName)!.add(callback);
    }

    public off(eventName: string, callback: EventCallback): void {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName)!.delete(callback);
        }
    }

    public emit(eventName: string, data: any): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: eventName, payload: data }));
        } else {
            console.warn('WebSocket is not open. Message not sent:', { eventName, data });
        }
    }

    private emitEvent(eventName: string, data: any): void {
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName)!.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in WebSocket event listener for '${eventName}':`, error);
                }
            });
        }
    }
}

// Export a singleton instance via a getter function (lazy initialization)
let serviceInstance: WebSocketService | null = null;
export const getWebsocketService = (): WebSocketService => {
    if (!serviceInstance) {
        serviceInstance = new WebSocketService();
    }
    return serviceInstance;
};