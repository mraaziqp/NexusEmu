import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gamepad2, X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

const ICONS: Record<ToastItem['type'], React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4" />,
  error:   <AlertCircle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  info:    <Info className="w-4 h-4" />,
};

const COLORS: Record<ToastItem['type'], string> = {
  success: 'bg-green-500/20 text-green-400 border-green-500/30',
  error:   'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info:    'bg-nexus-accent/20 text-nexus-accent border-nexus-accent/30',
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => (
  <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
    <AnimatePresence mode="popLayout">
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          layout
          initial={{ opacity: 0, x: 80, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 80, scale: 0.9 }}
          className="pointer-events-auto flex items-center gap-4 px-5 py-4 bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl min-w-[300px] max-w-[420px]"
        >
          <div className={`p-2 rounded-xl flex-shrink-0 border ${toast.game ? 'bg-nexus-accent/20 text-nexus-accent border-nexus-accent/30' : COLORS[toast.type]}`}>
            {toast.game ? <Gamepad2 className="w-4 h-4" /> : ICONS[toast.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold leading-snug">{toast.message}</p>
            {toast.game && (
              <p className="text-[9px] font-mono text-nexus-muted uppercase mt-0.5 truncate">
                {toast.game.platform?.toUpperCase()} · {toast.game.title}
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-nexus-muted hover:text-white transition-colors flex-shrink-0 p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);
