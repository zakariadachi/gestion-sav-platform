import {
    TICKET_STATUS,
    TICKET_STATUS_LABELS,
    PRIORITIES,
    PRIORITY_LABELS,
} from '../constants/enums';

/* ─── Domain Types ───────────────────────────────────────────── */

export type ULID = string;

// Derived literal types from the JS constants map
export type TicketStatus = typeof TICKET_STATUS[keyof typeof TICKET_STATUS] | 'Fermé';
export type TicketPriority = typeof PRIORITIES[keyof typeof PRIORITIES];

export interface User {
    id: number;
    name: string;
    role: string;
    email?: string;
}

export interface Ticket {
    id: ULID;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    client_id?: number | null;
    technician_id?: number | null;
    due_date?: string | null;
    created_at?: string;
    updated_at?: string;
    user?: User;
    client?: User;
    technician?: User;
}

/* ─── Status config (unified) ─────────────────────────────────── */

export interface StatusConfig {
    color: string;
    bg: string;
    border: string;
    label: string;
    step: number;
    icon: string;
}

export const STATUS_CFG: Record<TicketStatus, StatusConfig> = {
    [TICKET_STATUS.NEW]: {
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.08)',
        border: 'rgba(59,130,246,0.2)',
        label: TICKET_STATUS_LABELS[TICKET_STATUS.NEW],
        step: 0,
        icon: 'fiber_new',
    },
    [TICKET_STATUS.IN_PROGRESS]: {
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
        label: TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS],
        step: 1,
        icon: 'pending',
    },
    [TICKET_STATUS.RESOLVED]: {
        color: '#10b981',
        bg: 'rgba(16,185,129,0.08)',
        border: 'rgba(16,185,129,0.2)',
        label: TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED],
        step: 2,
        icon: 'check_circle',
    },
    'Fermé': {
        color: '#6b7280',
        bg: 'rgba(107,114,128,0.08)',
        border: 'rgba(107,114,128,0.2)',
        label: 'Fermé',
        step: 3,
        icon: 'lock',
    },
};

/* ─── Priority config (unified) ───────────────────────────────── */

export interface PriorityConfig {
    color: string;
    label: string;
    icon: string;
}

export const PRIORITY_CFG: Record<TicketPriority, PriorityConfig> = {
    [PRIORITIES.LOW]: {
        color: '#6b7280',
        label: PRIORITY_LABELS[PRIORITIES.LOW],
        icon: 'keyboard_arrow_down',
    },
    [PRIORITIES.MEDIUM]: {
        color: '#3b82f6',
        label: PRIORITY_LABELS[PRIORITIES.MEDIUM],
        icon: 'drag_handle',
    },
    [PRIORITIES.HIGH]: {
        color: '#f97316',
        label: PRIORITY_LABELS[PRIORITIES.HIGH],
        icon: 'keyboard_arrow_up',
    },
    [PRIORITIES.CRITICAL]: {
        color: '#ef4444',
        label: PRIORITY_LABELS[PRIORITIES.CRITICAL],
        icon: 'warning',
    },
};

/* ─── Pure helper functions ───────────────────────────────────── */

/** Extract up to 2 initials from a full name. */
export const getInitials = (name?: string | null): string =>
    name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '??';

export interface HashPalette {
    bg: string;
    text: string;
}

/** Deterministic avatar color from a string. */
export const hashColor = (str: string = ''): HashPalette => {
    const palette: HashPalette[] = [
        { bg: '#dbeafe', text: '#1e40af' },
        { bg: '#d1fae5', text: '#065f46' },
        { bg: '#e0e7ff', text: '#3730a3' },
        { bg: '#ffedd5', text: '#9a3412' },
        { bg: '#fce7f3', text: '#9d174d' },
        { bg: '#ccfbf1', text: '#115e59' },
    ];
    const i = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
    return palette[i];
};

/** Short date: "03 juil. 2026" */
export const fmt = (iso?: string | null): string =>
    iso
        ? new Date(iso).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
          })
        : '—';

/** Full date: "jeudi 3 juillet 2026" */
export const fmtFull = (iso?: string | null): string =>
    iso
        ? new Date(iso).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          })
        : '—';

/** Relative time: "Il y a 5 min", "Il y a 3h", etc. */
export const timeAgo = (iso?: string | null): string => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return `Il y a ${Math.floor(diff / 86400)}j`;
};

/* ─── SLA Helpers ─────────────────────────────────────────────── */

/** Check if ticket is overdue (due_date is past and not resolved). */
export const isOverdue = (ticket: Ticket): boolean => {
    if (!ticket.due_date) return false;
    if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === 'Fermé') return false;
    return new Date(ticket.due_date).getTime() < Date.now();
};

/** Check if ticket is due within the next 2 hours. */
export const isDueSoon = (ticket: Ticket): boolean => {
    if (!ticket.due_date) return false;
    if (ticket.status === TICKET_STATUS.RESOLVED || ticket.status === 'Fermé') return false;
    if (isOverdue(ticket)) return false;
    
    const diffMs = new Date(ticket.due_date).getTime() - Date.now();
    return diffMs > 0 && diffMs <= 2 * 60 * 60 * 1000; // <= 2 hours
};

/* ─── Animation variants ──────────────────────────────────────── */

export const fadeIn = {
    hidden: { opacity: 0, y: 8 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
};
