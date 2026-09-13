import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, mode } = useAppStore();

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl min-w-[280px] max-w-sm ${
              toast.type === 'error'
                ? 'bg-rose-950/80 border-rose-500/30 text-rose-100'
                : toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100'
                : 'bg-[#151520]/90 border-white/10 text-white'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className={`w-5 h-5 shrink-0 ${mode === 'movies' ? 'text-amber-400' : 'text-emerald-400'}`} />
            )}

            <div className="flex-1">
              <p className="text-sm font-medium leading-tight">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-gray-400 mt-0.5">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
