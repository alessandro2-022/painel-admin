import React from 'react';
import ReactDOM from 'react-dom/client';
import DriverApp from './DriverApp';
import { ThemeProvider } from '../hooks/useTheme';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <DriverApp />
    </ThemeProvider>
  </React.StrictMode>
);