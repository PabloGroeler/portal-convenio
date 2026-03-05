import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const bg = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-blue-50 border-blue-200 text-blue-700';

  return (
    <div className={`fixed right-4 top-4 z-50 w-80 border p-3 rounded-lg shadow-sm ${bg}`}>
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default Toast;

