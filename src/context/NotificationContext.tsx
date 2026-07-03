import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, Terminal } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {notifications.map((notification) => (
            <motion.div
              layout
              key={notification.id}
              initial={{ opacity: 0, x: 100, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                "pointer-events-auto flex items-start justify-between gap-3 px-4 py-4 border-4 border-black neo-shadow-lg w-80 relative group hover:-rotate-1 transition-transform",
                notification.type === 'success' ? 'bg-neo-accent text-black' : '',
                notification.type === 'error' ? 'bg-[#FF3366] text-black' : '',
                notification.type === 'info' ? 'bg-neo-secondary text-black' : ''
              )}
            >
              <div className="flex items-start gap-3 flex-1 relative z-10">
                <div className="mt-0.5 shrink-0 bg-white border-2 border-black p-1 neo-shadow-sm">
                  {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-black" strokeWidth={3} />}
                  {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-black" strokeWidth={3} />}
                  {notification.type === 'info' && <Info className="w-5 h-5 text-black" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                   <p className="text-xs font-black uppercase tracking-widest mb-1 underline decoration-2 underline-offset-2">
                     {notification.type === 'success' ? 'Task Success' : notification.type === 'error' ? 'Critical Error' : 'System Notice'}
                   </p>
                   <p className="text-sm font-bold leading-snug uppercase tracking-wide">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-black hover:bg-white border-2 border-transparent hover:border-black transition-colors shrink-0 p-1 relative z-10"
              >
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
              <div className="absolute bottom-0 left-0 h-1.5 bg-black" style={{ animationName: 'shrink', animationDuration: '5s', animationTimingFunction: 'linear' }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
