import React from 'react';

const animationStyles = `
@keyframes pulse-orb {
  0%, 100% {
    opacity: 0.5;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}
.animate-pulse-orb {
  animation: pulse-orb 4s ease-in-out infinite;
}
`;

export const FocusOrbIcon: React.FC<{ className?: string }> = ({ className = "w-24 h-24" }) => (
  <>
    <style>{animationStyles}</style>
    <svg 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="orbGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" style={{ stopColor: 'rgb(56, 189, 248)', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: 'rgb(14, 116, 144)', stopOpacity: 0.2 }} />
        </radialGradient>
      </defs>
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="url(#orbGradient)" 
        className="animate-pulse-orb text-sky-500"
      />
    </svg>
  </>
);

export const AnimatedFolderIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-sky-500 flex-shrink-0" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className={`${className} transition-all duration-200 group-hover:text-yellow-400 group-hover:scale-110 group-hover:-rotate-2`}
    >
      <path d="M2 3.5A1.5 1.5 0 0 1 3.5 2h2.879a1.5 1.5 0 0 1 1.06.44l.822.822A1.5 1.5 0 0 0 9.32 4H16.5A1.5 1.5 0 0 1 18 5.5v10A1.5 1.5 0 0 1 16.5 17H3.5A1.5 1.5 0 0 1 2 15.5v-12Z" />
    </svg>
);