import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TicketToastProps {
    toast: string;
    setToast: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * TicketToast
 *
 * Floating notification toast for ticket operations.
 * Handles both success and error variations based on string content.
 */
export default function TicketToast({ toast, setToast }: TicketToastProps) {
    return (
        <AnimatePresence>
            {toast && (() => {
                const isError = toast.includes('✗') || toast.toLowerCase().includes('erreur');
                const color = isError ? '#ef4444' : '#10b981';
                const icon = isError ? 'error' : 'check_circle';
                const title = isError ? 'ERREUR' : 'SUCCÈS';
                const bg = isError ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)';
                const borderColor = isError ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)';
                const gradient = isError
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                    : 'linear-gradient(135deg, #10b981, #059669)';

                return (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, x: 60, scale: 0.92 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 60, scale: 0.92 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            padding: '14px 44px 14px 18px',
                            maxWidth: '420px',
                            background: 'var(--dc-surface)',
                            color: 'var(--dc-text)',
                            borderRadius: '16px',
                            border: `1px solid ${borderColor}`,
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 30px -5px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                bottom: 0,
                                width: '4px',
                                background: gradient,
                                borderRadius: '16px 0 0 16px',
                            }}
                        />
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                background: bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 20, color }}
                            >
                                {icon}
                            </span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    color,
                                    lineHeight: 1,
                                    marginBottom: '3px',
                                }}
                            >
                                {title}
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    color: 'var(--dc-text)',
                                    lineHeight: 1.4,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {toast.replace(/^[✓✗]\s*/, '')}
                            </div>
                        </div>
                        <button
                            onClick={() => setToast('')}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                width: '28px',
                                height: '28px',
                                borderRadius: '8px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--dc-text-faint)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                close
                            </span>
                        </button>
                    </motion.div>
                );
            })()}
        </AnimatePresence>
    );
}
