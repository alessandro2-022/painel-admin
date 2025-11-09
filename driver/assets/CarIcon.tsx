import React from 'react';

const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 20.25h8.25A2.25 2.25 0 0018.75 18V9.75a2.25 2.25 0 00-2.25-2.25H6.375a2.25 2.25 0 00-2.25 2.25v8.25a2.25 2.25 0 002.25 2.25z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5h.375m17.25 0h.375m-17.25 0a2.25 2.25 0 01-2.25-2.25v-1.5a2.25 2.25 0 012.25-2.25H6.75m11.25 0h.375a2.25 2.25 0 012.25 2.25v1.5a2.25 2.25 0 01-2.25 2.25m-17.25 0h.375M9 13.5l.75 4.5m4.5-4.5l.75 4.5M11.25 13.5c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125-1.125.504-1.125 1.125.504 1.125 1.125 1.125z" />
    </svg>
);

export default CarIcon;
