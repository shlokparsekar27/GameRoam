import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

// TOAST TYPES
const ICONS = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
    loading: Loader2
};

const STYLES = {
    success: 'border-emerald-500/50 bg-emerald-950/90 text-emerald-400 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]',
    error: 'border-flux/50 bg-red-950/90 text-flux shadow-[0_0_15px_-3px_rgba(239,68,68,0.3)]',
    warning: 'border-amber-500/50 bg-amber-950/90 text-amber-400 shadow-[0_0_15px_-3px_rgba(245,158,11,0.3)]',
    info: 'border-cyber/50 bg-cyan-950/90 text-cyber shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]',
    loading: 'border-void-600 bg-void-900/90 text-slate-300'
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);

        if (type !== 'loading') {
            setTimeout(() => removeToast(id), duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const success = (msg) => addToast('success', msg);
    const error = (msg) => addToast('error', msg);
    const warning = (msg) => addToast('warning', msg);
    const info = (msg) => addToast('info', msg);

    // For async operations
    const promise = async (promiseObj, { loading, success, error }) => {
        const id = addToast('loading', loading);
        try {
            const result = await promiseObj;
            removeToast(id);
            addToast('success', typeof success === 'function' ? success(result) : success);
            return result;
        } catch (err) {
            removeToast(id);
            addToast('error', typeof error === 'function' ? error(err) : error);
            throw err;
        }
    };

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info, promise }}>
            {children}
            {createPortal(
                <div className="fixed top-24 right-4 z-[10000] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                    <AnimatePresence>
                        {toasts.map(toast => {
                            const Icon = ICONS[toast.type];
                            return (
                                <motion.div
                                    key={toast.id}
                                    initial={{ opacity: 0, x: 50, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                    layout
                                    className={`pointer-events-auto relative p-4 clip-chamfer border backdrop-blur-md flex items-start gap-3 overflow-hidden ${STYLES[toast.type]}`}
                                >
                                    {/* Scan Line Animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

                                    <Icon size={20} className={`shrink-0 mt-0.5 ${toast.type === 'loading' ? 'animate-spin' : ''}`} />

                                    <div className="flex-1 min-w-0">
                                        <p className="font-mech font-bold text-sm uppercase tracking-wide leading-tight">
                                            {toast.type === 'error' ? 'SYSTEM_ALERT' :
                                                toast.type === 'success' ? 'TASK_COMPLETE' :
                                                    toast.type === 'warning' ? 'WARNING' :
                                                        toast.type === 'loading' ? 'PROCESSING' : 'INTEL'}
                                        </p>
                                        <p className="font-code text-xs opacity-90 break-words mt-1 leading-relaxed">
                                            {toast.message}
                                        </p>
                                    </div>

                                    {toast.type !== 'loading' && (
                                        <button
                                            onClick={() => removeToast(toast.id)}
                                            className="opacity-50 hover:opacity-100 transition shrink-0"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
}
