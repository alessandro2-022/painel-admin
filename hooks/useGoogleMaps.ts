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

// Função que injeta o script do Google Maps na página.
const loadGoogleMapsScript = () => {
    // Garante que o script seja carregado apenas uma vez.
    if (loadStatus !== 'idle') {
        return;
    }

    loadStatus = 'loading';

    const GOOGLE_MAPS_API_KEY = process.env.API_KEY; // Corrigido para usar a chave de API padrão
    if (!GOOGLE_MAPS_API_KEY) {
        loadStatus = 'error';
        loadingError = new Error("A chave da API do Google está ausente. Por favor, defina a variável de ambiente API_KEY."); // Mensagem de erro atualizada
        notifyListeners();
        return;
    }

    const successCallbackName = `golyMapsSuccess_${Date.now()}`;
    const authErrorCallbackName = `golyMapsAuthError_${Date.now()}`;

    // Callback de sucesso: esta é a ÚNICA maneira de marcarmos o carregamento como bem-sucedido.
    (window as any)[successCallbackName] = () => {
        // Se um erro de autenticação já ocorreu, não fazemos nada.
        if (loadStatus === 'error') return;
        
        loadStatus = 'loaded';
        loadingError = null;
        notifyListeners();
        // Limpa as funções globais
        delete (window as any)[successCallbackName];
        delete (window as any)[authErrorCallbackName];
    };

    // Callback de erro de autenticação: esta é uma falha definitiva.
    (window as any)[authErrorCallbackName] = () => {
        loadStatus = 'error';
        loadingError = new Error('A autenticação do Google Maps falhou. A chave da API pode ser inválida, estar expirada ou mal configurada.');
        notifyListeners();
        // Limpa as funções globais
        delete (window as any)[successCallbackName];
        delete (window as any)[authErrorCallbackName];
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    // Adiciona o parâmetro `callback` e `auth_error_callback` à URL
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=marker,routes,places&callback=${successCallbackName}&auth_error_callback=${authErrorCallbackName}`;
    script.async = true;
    script.defer = true;

    // Não precisamos mais do script.onload. Confiamos nos callbacks.
    // Ainda precisamos do script.onerror para falhas de rede.
    script.onerror = () => {
        loadStatus = 'error';
        loadingError = new Error('O script do Google Maps não pôde ser carregado. Por favor, verifique sua conexão de rede.');
        notifyListeners();
        // Limpa as funções globais por precaução
        delete (window as any)[successCallbackName];
        delete (window as any)[authErrorCallbackName];
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