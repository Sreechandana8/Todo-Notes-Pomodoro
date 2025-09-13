import React from 'react';

const animationStyles = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.fade-in-1 { animation: fadeIn 0.5s ease-out 0.2s forwards; }
.fade-in-2 { animation: fadeIn 0.5s ease-out 0.4s forwards; }
`;

export const Logo: React.FC = () => {
  return (
    <>
      <style>{animationStyles}</style>
      <div className="flex items-center gap-2" aria-label="All-In-One Focus">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-sky-400">
            <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            <path d="M12 7C14.7614 7 17 9.23858 17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 12.5C12.2761 12.5 12.5 12.2761 12.5 12C12.5 11.7239 12.2761 11.5 12 11.5C11.7239 11.5 11.5 11.7239 11.5 12C11.5 12.2761 11.7239 12.5 12 12.5Z" fill="currentColor" stroke="currentColor"/>
        </svg>
        <div className="text-lg md:text-xl font-bold flex items-center gap-1.5">
          <span className="opacity-0 fade-in-1 text-slate-200">All-In-One</span>
          <span className="opacity-0 fade-in-2 text-sky-400">Focus</span>
        </div>
      </div>
    </>
  );
};