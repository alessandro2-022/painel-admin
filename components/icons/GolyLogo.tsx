import React from 'react';

const GolyLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M0 0 L20 10 L0 20 Z" fill="#FFD700" />
  </svg>
);

export default GolyLogo;