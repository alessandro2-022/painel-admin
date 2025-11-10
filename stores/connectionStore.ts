type Status = 'idle' | 'connecting' | 'connected' | 'error';
interface ConnectionState {
    status: Status;
    message: string | null;
}
type Listener = (state: ConnectionState) => void;

class ConnectionStore {
    private state: ConnectionState = { status: 'idle', message: null };
    private listeners: Set<Listener> = new Set();

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    setState(status: Status, message: string | null = null) {
        // Evita atualizações desnecessárias se o estado for o mesmo
        if (this.state.status === status && this.state.message === message) {
            return;
        }
        this.state = { status, message };
        this.listeners.forEach(listener => listener(this.state));
    }

    getState(): ConnectionState {
        return this.state;
    }
}

// Exporta uma única instância para ser usada em toda a aplicação
export const connectionStore = new ConnectionStore();
