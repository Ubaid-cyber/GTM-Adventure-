import React from 'react';

interface MountainLogoProps {
  className?: string;
}

export default function MountainLogo({ className = "w-8 h-8" }: MountainLogoProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path 
        d="M8 48L24 24M24 24L32 12L44 28M44 28L56 44M18 42L28 32M36 32L48 48" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="32" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}
