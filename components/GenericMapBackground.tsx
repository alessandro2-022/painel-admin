import React from 'react';
// REMOVIDO: import { useTheme } from '../hooks/useTheme.tsx';

const GenericMapBackground: React.FC = () => {
    // REMOVIDO: const [theme] = useTheme();
    // REMOVIDO: const isDark = theme === 'dark';

    // Cores fixas para o tema claro
    const bgColor = '#ffffff'; // white
    const gridColor = '#e5e7eb'; // gray-200
    const blockColor = '#f9fafb'; // gray-50

    return (
        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <pattern id="map_grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridColor} strokeWidth="1"/>
                </pattern>
                <pattern id="map_blocks" width="160" height="160" patternUnits="userSpaceOnUse">
                    <rect width="60" height="40" x="10" y="20" fill={blockColor} rx="4" />
                    <rect width="40" height="70" x="90" y="50" fill={blockColor} rx="4" />
                    <rect width="50" height="30" x="70" y="120" fill={blockColor} rx="4" />
                </pattern>
            </defs>

            <rect width="100%" height="100%" fill={bgColor} />
            <rect width="100%" height="100%" fill="url(#map_blocks)" />
            <rect width="100%" height="100%" fill="url(#map_grid)" opacity={0.5} />
        </svg>
    );
};

export default GenericMapBackground;