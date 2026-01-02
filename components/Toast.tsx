import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-500" />,
    error: <AlertCircle size={18} className="text-rose-500" />,
    info: <Info size={18} className="text-blue-500" />,
  };
  
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/20',
    error: 'bg-rose-500/10 border-rose-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
  };
  
  return (
    <div className={`flex items-center space-x-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] animate-in slide-in-from-right-12 fade-in duration-500 ${styles[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <p className="text-[11px] font-black uppercase tracking-widest text-white leading-tight max-w-[240px]">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-all text-gray-500 hover:text-white">
        <X size={14} />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string, message: string, type: 'success' | 'error' | 'info' }>>([]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);
  
  const ToastContainer = () => (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast 
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
  
  return { showToast, ToastContainer };
};