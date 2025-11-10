import { useState, useEffect } from 'react';

// Estado singleton para gerenciar o carregamento do script do Google Maps globalmente.
// Isso evita condições de corrida e garante que o script seja carregado apenas uma vez.
let loadStatus: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
let loadingError: Error | null = null;
const listeners: ((status: typeof loadStatus, error: Error | null) => void)[] = [];

// Notifica todos os componentes que estão usando o hook sobre a mudança de estado.
const notifyListeners = () => {
    listeners.forEach(listener => listener(loadStatus, loadingError));
};

// Define a callback de falha de autenticação global uma única vez.
// O Google Maps JS API procurará especificamente por esta função.
(window as any).gm_authFailure = () => {
    if (loadStatus === 'error') return; // Evita múltiplas notificações de erro
    loadStatus = 'error';
    loadingError = new Error('A autenticação do Google Maps falhou. A chave da API pode ser inválida, estar expirada ou mal configurada.');
    notifyListeners();
};


// Função que injeta o script do Google Maps na página.
const loadGoogleMapsScript = () => {
    // Garante que o script seja carregado apenas uma vez.
    if (loadStatus !== 'idle') {
        return;
    }

    loadStatus = 'loading';

    const GOOGLE_MAPS_API_KEY = process.env.API_KEY;
    if (!GOOGLE_MAPS_API_KEY) {
        loadStatus = 'error';
        loadingError = new Error("A chave da API do Google está ausente. Por favor, defina a variável de ambiente API_KEY.");
        console.warn("API_KEY do Google Maps não encontrada. Certifique-se de que a variável de ambiente 'API_KEY' está configurada corretamente em seu ambiente de hospedagem.");
        notifyListeners();
        return;
    }

    const successCallbackName = `golyMapsSuccess_${Date.now()}`;

    // Callback de sucesso: esta é a ÚNICA maneira de marcarmos o carregamento como bem-sucedido.
    (window as any)[successCallbackName] = () => {
        // Se um erro de autenticação já ocorreu (através de gm_authFailure), não fazemos nada.
        if (loadStatus === 'error') {
            delete (window as any)[successCallbackName];
            return;
        }
        
        loadStatus = 'loaded';
        loadingError = null;
        notifyListeners();
        // Limpa a função global de sucesso
        delete (window as any)[successCallbackName];
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    // Removido o parâmetro não padrão `auth_error_callback`. A falha de autenticação
    // agora é capturada pela função global `window.gm_authFailure`.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker,routes,places&callback=${successCallbackName}`;
    script.async = true;
    script.defer = true;

    // script.onerror para falhas de rede.
    script.onerror = () => {
        loadStatus = 'error';
        loadingError = new Error('O script do Google Maps não pôde ser carregado. Por favor, verifique sua conexão de rede.');
        notifyListeners();
        // Limpa a função de sucesso por precaução
        delete (window as any)[successCallbackName];
    };

    document.head.appendChild(script);
};

// O hook que os componentes usarão para acessar o status do Google Maps.
const useGoogleMaps = () => {
    // O estado inicial é definido a partir do estado global, caso o script já tenha sido carregado.
    const [isLoaded, setIsLoaded] = useState(loadStatus === 'loaded');
    const [loadError, setLoadError] = useState<Error | null>(loadingError);

    useEffect(() => {
        // Define um listener para esta instância de componente.
        const listener = (status: typeof loadStatus, error: Error | null) => {
            setIsLoaded(status === 'loaded');
            setLoadError(error);
        };
        
        listeners.push(listener);

        // Atualiza o estado inicial caso o script já tenha carregado antes do useEffect
        if(loadStatus === 'loaded') {
            setIsLoaded(true);
        } else if (loadStatus === 'error') {
            setLoadError(loadingError);
        }

        // Dispara o carregamento do script se ele ainda não tiver começado.
        if (loadStatus === 'idle') {
            loadGoogleMapsScript();
        }

        // Limpeza: remove o listener quando o componente é desmontado.
        return () => {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, []); // O array de dependências vazio garante que isso seja executado apenas uma vez por instância do componente.

    return { isLoaded, loadError };
};

export default useGoogleMaps;