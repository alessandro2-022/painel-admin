import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: Corrected file extension for App import.
import App from './App.tsx';
// REMOVIDO: import { ThemeProvider } from './hooks/useTheme.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* REMOVIDO: <ThemeProvider> */}
      <App />
    {/* REMOVIDO: </ThemeProvider> */}
  </React.StrictMode>
);