import { useState, useEffect } from 'react';
import { connectionStore } from '../stores/connectionStore.ts';

export const useConnectionStatus = () => {
    const [connectionState, setConnectionState] = useState(connectionStore.getState());

    useEffect(() => {
        // Subscreve o componente às atualizações do store e retorna a função de limpeza
        const unsubscribe = connectionStore.subscribe(setConnectionState);
        return () => unsubscribe();
    }, []);

    return connectionState;
};