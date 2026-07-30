import React from 'react';
import { TICKET_STATUS } from '../../constants/enums';
import TicketCard from '../TicketCard';
import { TicketTableProps } from './TicketTable';

/**
 * TicketMobileList
 *
 * Mobile-only card grid for the ticket list.
 */
export default function TicketMobileList({
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
    /* ── Loading skeleton ──────────────────────────────────────── */
    if (loading) {
        return (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="animate-pulse"
                        style={{
                            background: 'var(--dc-surface)',
                            border: '1px solid var(--dc-border)',
                            borderRadius: '12px',
                            padding: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div
                                className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60"
                                style={{ height: 10, width: 40 }}
                            />
                            <div
                                className="animate-pulse rounded-full bg-slate-200 dark:bg-zinc-700/60"
                                style={{ height: 20, width: 80 }}
                            />
                        </div>
                        <div
                            className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60"
                            style={{ height: 14, width: '70%' }}
                        />
                        <div
                            className="animate-pulse rounded-md bg-slate-200 dark:bg-zinc-700/60"
                            style={{ height: 10, width: '50%' }}
                        />
                    </div>
                ))}
            </div>
        );
    }

    /* ── Empty state ────────────────────────────────────────────── */
    if (tickets.length === 0) {
        return (
            <div className="tk-empty" style={{ padding: 40 }}>
                <div className="tk-empty-icon">
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                        inbox
                    </span>
                </div>
                <div className="tk-empty-title">Aucun ticket trouvé</div>
            </div>
        );
    }

    /* ── Card grid ──────────────────────────────────────────────── */
    return (
        <div className="es-cards-grid" style={{ padding: '20px' }}>
            {tickets.map((t) => (
                <TicketCard
                    key={t.id}
                    ticket={t}
                    onClick={(ticket) => onView(ticket)}
                    actions={(ticket) => (
                        <>
                            {user?.role === 'Admin' && (
                                <div className="tk-tech-actions">
                                    {ticket.status !== TICKET_STATUS.RESOLVED && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onAssign(ticket); }}
                                            className="tk-btn-assign"
                                            style={{ padding: '6px 12px', fontSize: '11px' }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: 13 }}
                                            >
                                                person_add
                                            </span>{' '}
                                            {ticket.technician ? 'Ré-assigner' : 'Assigner'}
                                        </button>
                                    )}
                                    {onDelete && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDelete(ticket); }}
                                            className="tk-btn-rapport"
                                            style={{ padding: '6px 12px', fontSize: '11px', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: 13 }}
                                            >
                                                delete
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {user?.role === 'Technician' &&
                                Number(ticket.technician_id) === Number(user.id) &&
                                ticket.status !== TICKET_STATUS.RESOLVED && (
                                    <div className="tk-tech-actions">
                                        <button
                                            onClick={() => onResolve(ticket)}
                                            disabled={updatingStatusId === ticket.id}
                                            className="tk-btn-resolve"
                                            style={{ padding: '6px 10px', fontSize: '11px' }}
                                        >
                                            {updatingStatusId === ticket.id ? (
                                                <span
                                                    className="material-symbols-outlined animate-spin"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    progress_activity
                                                </span>
                                            ) : (
                                                <span
                                                    className="material-symbols-outlined"
                                                    style={{ fontSize: 12 }}
                                                >
                                                    check_circle
                                                </span>
                                            )}
                                            Résoudre
                                        </button>
                                        <button
                                            onClick={() => onRapport(ticket)}
                                            className="tk-btn-rapport"
                                            style={{ padding: '6px 10px', fontSize: '11px' }}
                                        >
                                            <span
                                                className="material-symbols-outlined"
                                                style={{ fontSize: 12 }}
                                            >
                                                edit_note
                                            </span>{' '}
                                            Rapport
                                        </button>
                                    </div>
                                )}
                        </>
                    )}
                />
            ))}
        </div>
    );
}
