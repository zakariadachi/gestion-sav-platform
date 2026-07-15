import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   NOTIFICATION SYSTEM — Premium SupportSync Design
   
   Usage:
     import { NotificationProvider, useNotification } from '../components/Notification';
     
     // Wrap your app:
     <NotificationProvider> <App /> </NotificationProvider>
     
     // In any component:
     const notify = useNotification();
     notify.success('Ticket créé avec succès !');
     notify.error('Erreur lors de la connexion.');
     notify.warning('Votre session expire bientôt.');
     notify.info('Mise à jour disponible.');
   ═══════════════════════════════════════════════════════════════ */

const NOTIFICATION_TYPES = {
    success: {
        icon: 'check_circle',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        bg: 'rgba(16, 185, 129, 0.06)',
        border: 'rgba(16, 185, 129, 0.18)',
        color: '#10b981',
        title: 'Succès',
    },
    error: {
        icon: 'error',
        gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
        bg: 'rgba(239, 68, 68, 0.06)',
        border: 'rgba(239, 68, 68, 0.18)',
        color: '#ef4444',
        title: 'Erreur',
    },
    warning: {
        icon: 'warning',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        bg: 'rgba(245, 158, 11, 0.06)',
        border: 'rgba(245, 158, 11, 0.18)',
        color: '#f59e0b',
        title: 'Attention',
    },
    info: {
        icon: 'info',
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        bg: 'rgba(59, 130, 246, 0.06)',
        border: 'rgba(59, 130, 246, 0.18)',
        color: '#3b82f6',
        title: 'Information',
    },
};

/* ── Single Toast Item ── */
const ToastItem = ({ id, type, message, onClose }) => {
    const cfg = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info;

    useEffect(() => {
        const timer = setTimeout(() => onClose(id), 5000);
        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="ss-toast"
            style={{
                '--toast-color': cfg.color,
                '--toast-bg': cfg.bg,
                '--toast-border': cfg.border,
            }}
        >
            {/* Left accent stripe */}
            <div className="ss-toast-accent" style={{ background: cfg.gradient }} />

            {/* Icon container */}
            <div className="ss-toast-icon" style={{ background: cfg.bg }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: cfg.color }}>
                    {cfg.icon}
                </span>
            </div>

            {/* Content */}
            <div className="ss-toast-content">
                <div className="ss-toast-title" style={{ color: cfg.color }}>{cfg.title}</div>
                <div className="ss-toast-message">{message}</div>
            </div>

            {/* Progress bar */}
            <motion.div
                className="ss-toast-progress"
                style={{ background: cfg.color }}
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
            />

            {/* Close button */}
            <button className="ss-toast-close" onClick={() => onClose(id)}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
        </motion.div>
    );
};

/* ── Toast Container ── */
const ToastContainer = ({ toasts, removeToast }) => (
    <div className="ss-toast-container">
        <AnimatePresence mode="popLayout">
            {toasts.map(t => (
                <ToastItem key={t.id} {...t} onClose={removeToast} />
            ))}
        </AnimatePresence>
    </div>
);

/* ── Inline Error Banner (for forms) ── */
export const InlineError = ({ message, onDismiss }) => {
    if (!message) return null;
    const cfg = NOTIFICATION_TYPES.error;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="ss-inline-error"
        >
            <div className="ss-inline-error-accent" style={{ background: cfg.gradient }} />
            <div className="ss-inline-error-icon">
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color }}>{cfg.icon}</span>
            </div>
            <span className="ss-inline-error-text">{message}</span>
            {onDismiss && (
                <button className="ss-inline-error-close" onClick={onDismiss}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
            )}
        </motion.div>
    );
};

/* ── Inline Warning Banner (for forms) ── */
export const InlineWarning = ({ message, onDismiss }) => {
    if (!message) return null;
    const cfg = NOTIFICATION_TYPES.warning;
    return (
        <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="ss-inline-error"
            style={{ '--inline-color': cfg.color, '--inline-bg': cfg.bg, '--inline-border': cfg.border }}
        >
            <div className="ss-inline-error-accent" style={{ background: cfg.gradient }} />
            <div className="ss-inline-error-icon" style={{ background: cfg.bg }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color }}>{cfg.icon}</span>
            </div>
            <span className="ss-inline-error-text">{message}</span>
            {onDismiss && (
                <button className="ss-inline-error-close" onClick={onDismiss}>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                </button>
            )}
        </motion.div>
    );
};

/* ── Page-level Error Banner (for Dashboard, Tickets) ── */
export const PageErrorBanner = ({ message, onRetry, onDismiss }) => {
    if (!message) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="ss-page-error"
        >
            <div className="ss-page-error-left">
                <div className="ss-page-error-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>cloud_off</span>
                </div>
                <div className="ss-page-error-content">
                    <div className="ss-page-error-title">Impossible de charger les données</div>
                    <div className="ss-page-error-message">{message}</div>
                </div>
            </div>
            <div className="ss-page-error-actions">
                {onRetry && (
                    <button className="ss-page-error-retry" onClick={onRetry}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span>
                        Réessayer
                    </button>
                )}
                {onDismiss && (
                    <button className="ss-page-error-dismiss" onClick={onDismiss}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

/* ── Context & Provider ── */
const NotificationContext = createContext(null);

let toastCounter = 0;

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type, message) => {
        const id = ++toastCounter;
        setToasts(prev => [...prev.slice(-4), { id, type, message }]); // Max 5 toasts
        return id;
    }, []);

    const notify = {
        success: (msg) => addToast('success', msg),
        error: (msg) => addToast('error', msg),
        warning: (msg) => addToast('warning', msg),
        info: (msg) => addToast('info', msg),
        dismiss: removeToast,
    };

    return (
        <NotificationContext.Provider value={notify}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        // Fallback: return a no-op notifier so components don't crash if used outside provider
        return {
            success: () => {},
            error: () => {},
            warning: () => {},
            info: () => {},
            dismiss: () => {},
        };
    }
    return ctx;
}

export default { NotificationProvider, useNotification, InlineError, InlineWarning, PageErrorBanner };
