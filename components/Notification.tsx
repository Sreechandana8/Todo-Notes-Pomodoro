import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Notification: React.FC<NotificationProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div 
        className="bg-sky-500 text-white rounded-lg shadow-lg p-4 mt-2 flex items-start justify-between max-w-sm w-full animate-slide-in-right" 
        role="alert" 
    >
      <p className="mr-4 text-sm">{message}</p>
      <button 
        onClick={onClose} 
        className="text-xl font-bold leading-none hover:text-sky-200 focus:outline-none flex-shrink-0 -mt-1"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};
