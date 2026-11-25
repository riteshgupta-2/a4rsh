import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineIndicatorProps {
  message: string;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ message }) => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-300/70 bg-amber-50/75 px-3.5 py-2 text-xs font-medium text-amber-900 shadow-lg backdrop-blur-md"
    >
      <WifiOff className="h-4 w-4 text-amber-700 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
