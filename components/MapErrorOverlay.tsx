import React from 'react';

interface MapErrorOverlayProps {
  message: string;
}

const MapErrorOverlay: React.FC<MapErrorOverlayProps> = ({ message }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 backdrop-blur-sm p-4 z-10">
    <div className="text-center bg-white p-8 rounded-lg shadow-2xl border border-red-200 max-w-md">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-red-800">Falha ao Carregar o Mapa</h3>
      <p className="mt-2 text-sm text-red-600">{message}</p>
      <p className="mt-4 text-xs text-slate-500">
        Certifique-se de que a variável de ambiente <code className="bg-red-100 p-1 rounded font-mono text-xs text-red-700">API_KEY</code> está configurada corretamente.
        <br />
        Isso pode ser devido a uma chave de API inválida, informações de faturamento ausentes ou restrições de API incorretas. Verifique o console do navegador para mais detalhes.
      </p>
    </div>
  </div>
);

export default MapErrorOverlay;