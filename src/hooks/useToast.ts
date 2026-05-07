import { useState, useCallback } from 'react';
import { ToastItem, Game } from '../types';

let _id = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((
    message: string,
    type: ToastItem['type'] = 'info',
    game?: Game,
    durationMs = 6000,
  ) => {
    const id = String(++_id);
    setToasts((prev) => [...prev.slice(-4), { id, message, type, game }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), durationMs);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
