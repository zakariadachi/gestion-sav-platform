import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import echo from '../services/echo';

// ── Types ────────────────────────────────────────────────────────────────────
interface NotificationData {
    ticket_id: string;
    ticket_title: string;
    status: string;
    message: string;
    url: string;
    created_at?: string;
}

interface Notification {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface PaginatedNotifications {
    data: Notification[];
    total: number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (dateStr: string): string => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60)  return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}j`;
};

const statusColor = (status: string): string => {
    const map: Record<string, string> = {
        open:       '#3b82f6',
        'in-progress': '#f59e0b',
        resolved:   '#10b981',
        closed:     '#6b7280',
    };
    return map[status?.toLowerCase()] ?? '#004ac6';
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount]   = useState(0);
    const [loading, setLoading]           = useState(true);
    const [markingAll, setMarkingAll]     = useState(false);

    // ── Fetch from API ──────────────────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.get<PaginatedNotifications>('/notifications');
            const list = res.data.data ?? [];
            setNotifications(list);
            setUnreadCount(list.filter(n => !n.read_at).length);
        } catch {
            // silently fail – the bell should never break the layout
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // ── Laravel Echo – real-time channel ─────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;

        const channel = echo.private(`App.Models.User.${user.id}`);

        channel.notification((notification: NotificationData & { id: string; created_at: string }) => {
            const newNotif: Notification = {
                id: notification.id ?? crypto.randomUUID(),
                type: 'App\\Notifications\\TicketStatusUpdatedNotification',
                data: notification,
                read_at: null,
                created_at: notification.created_at ?? new Date().toISOString(),
            };
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user?.id]);

    // ── Close on outside click ───────────────────────────────────────────────
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Mark single as read ──────────────────────────────────────────────────
    const handleMarkRead = async (notif: Notification, e: React.MouseEvent) => {
        e.stopPropagation();
        if (notif.read_at) return;
        try {
            await api.patch(`/notifications/${notif.id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === notif.id ? { ...n, read_at: new Date().toISOString() } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { /* silent */ }
    };

    // ── Mark all as read ──────────────────────────────────────────────────────
    const handleMarkAllRead = async () => {
        if (markingAll || unreadCount === 0) return;
        setMarkingAll(true);
        try {
            await api.post('/notifications/mark-all-read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
            setUnreadCount(0);
        } catch { /* silent */ } finally {
            setMarkingAll(false);
        }
    };

    // ── Click a notification row ──────────────────────────────────────────────
    const handleClick = async (notif: Notification) => {
        await handleMarkRead(notif, { stopPropagation: () => {} } as React.MouseEvent);
        setOpen(false);
        if (notif.data.url) navigate(notif.data.url);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative' }}>
            {/* ── Bell button ── */}
            <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setOpen(o => !o)}
                title="Notifications"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'var(--dc-surface, #f1f5f9)',
                    cursor: 'pointer',
                    color: 'var(--dc-text, #191c1e)',
                }}
            >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                </span>
                {/* Badge */}
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                            style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                minWidth: 17,
                                height: 17,
                                borderRadius: 999,
                                background: '#ef4444',
                                color: '#fff',
                                fontSize: 10,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 4px',
                                lineHeight: 1,
                                border: '2px solid var(--dc-bg, #fff)',
                            }}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* ── Dropdown ── */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0,  scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 10px)',
                            right: 0,
                            width: 340,
                            maxHeight: 460,
                            borderRadius: 14,
                            background: 'var(--dc-surface, #fff)',
                            border: '1px solid var(--dc-border, #e2e8f0)',
                            boxShadow: '0 20px 48px rgba(0,0,0,0.14)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            zIndex: 9999,
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--dc-border, #e2e8f0)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#004ac6' }}>notifications</span>
                                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--dc-text, #191c1e)' }}>Notifications</span>
                                {unreadCount > 0 && (
                                    <span style={{ background: '#004ac6', color: '#fff', borderRadius: 999, fontSize: 11, fontWeight: 700, padding: '1px 7px' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    disabled={markingAll}
                                    style={{ fontSize: 12, color: '#004ac6', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', opacity: markingAll ? 0.5 : 1 }}
                                >
                                    Tout lire
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            {loading ? (
                                <div style={{ padding: 32, textAlign: 'center', color: 'var(--dc-text-muted, #64748b)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#cbd5e1', display: 'block', marginBottom: 8 }}>notifications_off</span>
                                    <p style={{ margin: 0, fontSize: 13, color: 'var(--dc-text-muted, #64748b)', fontWeight: 500 }}>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <motion.div
                                        key={notif.id}
                                        whileHover={{ backgroundColor: 'var(--dc-hover, #f8fafc)' }}
                                        onClick={() => handleClick(notif)}
                                        style={{
                                            display: 'flex',
                                            gap: 12,
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--dc-border, #e2e8f0)',
                                            background: notif.read_at ? 'transparent' : 'rgba(0,74,198,0.04)',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        {/* Status dot */}
                                        <div style={{ flexShrink: 0, paddingTop: 3 }}>
                                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor(notif.data.status), display: 'block' }} />
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: notif.read_at ? 400 : 600, color: 'var(--dc-text, #191c1e)', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {notif.data.ticket_title}
                                            </p>
                                            <p style={{ margin: '0 0 4px', fontSize: 12, color: 'var(--dc-text-muted, #64748b)', lineHeight: 1.4 }}>
                                                {notif.data.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span style={{ background: statusColor(notif.data.status) + '20', color: statusColor(notif.data.status), borderRadius: 999, padding: '1px 7px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                                    {notif.data.status}
                                                </span>
                                                <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(notif.created_at)}</span>
                                            </div>
                                        </div>

                                        {/* Mark-read dot */}
                                        {!notif.read_at && (
                                            <div style={{ flexShrink: 0, paddingTop: 4 }}>
                                                <motion.button
                                                    whileHover={{ scale: 1.3 }}
                                                    onClick={(e) => handleMarkRead(notif, e)}
                                                    title="Marquer comme lu"
                                                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#004ac6', border: 'none', cursor: 'pointer', padding: 0 }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
