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
      {/* FIX: The DriverApp component requires an onLogout prop. Since this is a standalone entry point, a placeholder function is provided to satisfy the type requirement. */}
      <DriverApp onLogout={() => console.log('Logout triggered.')} />
    </ThemeProvider>
  </React.StrictMode>
);