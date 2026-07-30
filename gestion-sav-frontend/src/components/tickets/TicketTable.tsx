import React from 'react';
import { motion } from 'framer-motion';
import { TICKET_STATUS, PRIORITIES, PRIORITY_LABELS } from '../../constants/enums';
import { TableSkeleton } from '../ui/Skeletons';
import {
    STATUS_CFG,
    PRIORITY_CFG,
    getInitials,
    hashColor,
    fmt,
    fadeIn,
    isOverdue,
    isDueSoon,
    Ticket,
    User,
    ULID,
} from '../../lib/ticket-helpers';

/**
 * TicketTable — Premium card-style redesign
 */

export interface TicketTableProps {
    tickets: Ticket[];
    loading: boolean;
    user?: User | null;
    updatingStatusId?: ULID | null;
    onView: (ticket: Ticket) => void;
    onAssign: (ticket: Ticket) => void;
    onResolve: (ticket: Ticket) => void;
    onRapport: (ticket: Ticket) => void;
    onDelete?: (ticket: Ticket) => void;
}

export default function TicketTable({
    tickets,
    loading,
    user,
    updatingStatusId,
    onView,
    onAssign,
    onResolve,
    onRapport,
    onDelete,
}: TicketTableProps) {
    return (
        <div className="dc-hide-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Header Row */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 150px 160px 100px 160px 120px 48px',
                padding: '10px 20px',
                background: 'var(--dc-surface-2)',
                borderBottom: '1px solid var(--dc-border)',
                borderRadius: '0',
            }}>
                {['Ticket', 'Titre', 'Client', 'Technicien', 'Priorité', 'Statut', 'Échéance', ''].map((h) => (
                    <div key={h} style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--dc-text-faint)',
                    }}>
                        {h}
                    </div>
                ))}
            </div>

            {/* Skeleton */}
            {loading && (
                <table style={{ width: '100%' }}>
                    <tbody>
                        <TableSkeleton rows={5} />
                    </tbody>
                </table>
            )}

            {/* Empty state */}
            {!loading && tickets.length === 0 && (
                <div style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: 'var(--dc-text-faint)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'var(--dc-surface-2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--dc-text-faint)' }}>inbox</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text-muted)' }}>Aucun ticket trouvé</div>
                    <div style={{ fontSize: '12px', color: 'var(--dc-text-faint)' }}>Essayez de modifier vos critères de recherche</div>
                </div>
            )}

            {/* Ticket rows */}
            {!loading && tickets.map((t, i) => (
                <TicketRow
                    key={t.id}
                    ticket={t}
                    user={user}
                    updatingStatusId={updatingStatusId}
                    onView={onView}
                    onAssign={onAssign}
                    onResolve={onResolve}
                    onRapport={onRapport}
                    onDelete={onDelete}
                    index={i}
                />
            ))}
        </div>
    );
}

/* ─── Single ticket row ── */

interface TicketRowProps {
    ticket: Ticket;
    user?: User | null;
    updatingStatusId?: ULID | null;
    onView: (ticket: Ticket) => void;
    onAssign: (ticket: Ticket) => void;
    onResolve: (ticket: Ticket) => void;
    onRapport: (ticket: Ticket) => void;
    onDelete?: (ticket: Ticket) => void;
    index: number;
}

function TicketRow({ ticket: t, user, updatingStatusId, onView, onAssign, onResolve, onRapport, onDelete, index }: TicketRowProps) {
    const sb = STATUS_CFG[t.status] ?? STATUS_CFG[TICKET_STATUS.NEW];
    const pb = PRIORITY_CFG[t.priority] ?? PRIORITY_CFG[PRIORITIES.MEDIUM];
    const techCol = hashColor(t.technician?.name ?? '');
    const clientCol = hashColor(t.client?.name ?? '');
    const overdue = isOverdue(t);
    const dueSoon = isDueSoon(t);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
            onClick={() => onView(t)}
            role="button"
            tabIndex={0}
            aria-label={`Voir le ticket : ${t.title}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(t); } }}
            className="tk-row-card"
            style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr 150px 160px 100px 160px 120px 48px',
                alignItems: 'center',
                padding: '0',
                borderBottom: '1px solid var(--dc-border)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                borderLeft: `3px solid ${sb.color}`,
                position: 'relative',
            }}
            whileHover={{ backgroundColor: 'var(--dc-surface-2)' } as any}
        >
            {/* Ticket ID + created date */}
            <div style={{ padding: '14px 16px 14px 20px' }}>
                <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--dc-text-faint)',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '150px',
                }}>
                    #{t.id}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--dc-text-faint)', marginTop: 4, fontWeight: 500 }}>
                    {fmt(t.created_at)}
                </div>
            </div>

            {/* Title + description */}
            <div style={{ padding: '14px 16px', minWidth: 0 }}>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--dc-text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                }}>
                    {t.title}
                </div>
                {t.description && (
                    <div style={{
                        fontSize: '11px',
                        color: 'var(--dc-text-faint)',
                        marginTop: 3,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 400,
                    }}>
                        {t.description}
                    </div>
                )}
            </div>

            {/* Client */}
            <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                        width: 26,
                        height: 26,
                        borderRadius: 8,
                        background: clientCol.bg,
                        color: clientCol.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 800,
                        flexShrink: 0,
                    }}>
                        {getInitials(t.client?.name ?? '?')}
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.client?.name ?? '—'}
                    </span>
                </div>
            </div>

            {/* Technician */}
            <div style={{ padding: '14px 16px' }} onClick={(e) => e.stopPropagation()}>
                {t.technician ? (
                    <div
                        style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: user?.role === 'Admin' && t.status !== TICKET_STATUS.RESOLVED ? 'pointer' : 'default' }}
                        onClick={() => { if (user?.role === 'Admin' && t.status !== TICKET_STATUS.RESOLVED) onAssign(t); }}
                        title={user?.role === 'Admin' && t.status !== TICKET_STATUS.RESOLVED ? 'Cliquez pour ré-assigner' : ''}
                    >
                        <div style={{
                            width: 26,
                            height: 26,
                            borderRadius: 8,
                            background: techCol.bg,
                            color: techCol.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 9,
                            fontWeight: 800,
                            flexShrink: 0,
                        }}>
                            {getInitials(t.technician.name)}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.technician.name}
                        </span>
                    </div>
                ) : user?.role === 'Admin' && t.status !== TICKET_STATUS.RESOLVED ? (
                    <button onClick={() => onAssign(t)} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '5px 10px',
                        borderRadius: 8,
                        border: '1px dashed rgba(59,130,246,0.4)',
                        background: 'rgba(59,130,246,0.05)',
                        color: 'var(--dc-accent)',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person_add</span>
                        Assigner
                    </button>
                ) : (
                    <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--dc-text-faint)' }}>Non assigné</span>
                )}
            </div>

            {/* Priority */}
            <div style={{ padding: '14px 12px' }}>
                <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: 100,
                    fontSize: 9,
                    fontWeight: 800,
                    textTransform: 'uppercase' as const,
                    letterSpacing: '0.5px',
                    color: pb.color,
                    background: `color-mix(in srgb, ${pb.color} 12%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${pb.color} 25%, transparent)`,
                }}>
                    {PRIORITY_LABELS[t.priority] ?? PRIORITY_LABELS[PRIORITIES.MEDIUM]}
                </span>
            </div>

            {/* Status + Actions */}
            <div style={{ padding: '14px 12px' }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
                    {/* Status badge */}
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                        padding: '4px 10px',
                        borderRadius: 100,
                        fontSize: 9,
                        fontWeight: 800,
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px',
                        color: sb.color,
                        background: sb.bg,
                        border: `1px solid ${sb.border}`,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sb.color, flexShrink: 0 }} />
                        {sb.label}
                    </span>

                    {/* Technician action buttons */}
                    {user?.role === 'Technician' && Number(t.technician_id) === Number(user.id) && t.status !== TICKET_STATUS.RESOLVED && (
                        <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => onResolve(t)} disabled={updatingStatusId === t.id} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(16,185,129,0.2)',
                                background: 'rgba(16,185,129,0.07)', color: '#10b981',
                                fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>
                                    {updatingStatusId === t.id ? 'progress_activity' : 'check_circle'}
                                </span>
                                Résoudre
                            </button>
                            <button onClick={() => onRapport(t)} style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                padding: '3px 7px', borderRadius: 6, border: '1px solid rgba(59,130,246,0.2)',
                                background: 'rgba(59,130,246,0.07)', color: 'var(--dc-accent)',
                                fontSize: 9, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 11 }}>edit_note</span>
                                Rapport
                            </button>
                        </div>
                    )}

                    {/* delete moved to dedicated column */}
                </div>

            </div>

            {/* Due date (SLA) */}
            <div style={{ padding: '14px 12px' }}>
                {t.due_date ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {(overdue || dueSoon) && (
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                fontSize: 9,
                                fontWeight: 800,
                                textTransform: 'uppercase' as const,
                                letterSpacing: '0.5px',
                                color: overdue ? '#ef4444' : '#f59e0b',
                                background: overdue ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                                padding: '2px 7px',
                                borderRadius: 6,
                                width: 'fit-content',
                            }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 10 }}>
                                    {overdue ? 'warning' : 'schedule'}
                                </span>
                                {overdue ? 'En retard' : 'Bientôt'}
                            </span>
                        )}
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            color: overdue ? '#ef4444' : dueSoon ? '#f59e0b' : 'var(--dc-text-faint)',
                        }}>
                            {fmt(t.due_date)}
                        </span>
                    </div>
                ) : (
                    <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--dc-text-faint)' }}>—</span>
                )}
            </div>
            {/* ── Delete action (hover icon) ── */}
            <div
                style={{ padding: '14px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={(e) => e.stopPropagation()}
            >
                {user?.role === 'Admin' && onDelete && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(t); }}
                        title="Supprimer ce ticket"
                        className="tk-delete-icon-btn"
                        style={{
                            width: 30,
                            height: 30,
                            borderRadius: 8,
                            border: '1px solid transparent',
                            background: 'transparent',
                            color: 'var(--dc-text-faint)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'all 0.15s ease',
                        }}
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
}
