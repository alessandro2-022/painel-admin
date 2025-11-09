import React from 'react';
import { useTheme } from '../hooks/useTheme';

const GenericMapBackground: React.FC = () => {
    const [theme] = useTheme();
    const isDark = theme === 'dark';

    // Theme-based colors for a more robust SVG rendering that avoids issues with CSS classes inside SVGs.
    const bgColor = isDark ? '#1e293b' : '#f1f5f9'; // slate-800 : slate-100
    const gridColor = isDark ? '#334155' : '#cbd5e1'; // slate-700 : slate-300
    const blockColor = isDark ? '#0f172a' : '#ffffff'; // slate-900 : white

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
