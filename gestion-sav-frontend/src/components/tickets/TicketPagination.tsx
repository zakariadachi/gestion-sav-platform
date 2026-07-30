import React from 'react';
import { STATUS_CFG, Ticket, TicketStatus } from '../../lib/ticket-helpers';

interface Meta {
    current_page: number;
    last_page: number;
    total: number;
}

interface TicketPaginationProps {
    tickets: Ticket[];
    meta: Meta | null;
    page: number;
    setPage: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * TicketPagination
 *
 * Renders the table footer containing:
 * - Status badges (count of tickets per status on the current page)
 * - Pagination controls (Previous / Next buttons + page info)
 */
export default function TicketPagination({ tickets, meta, page, setPage }: TicketPaginationProps) {
    if (!tickets || tickets.length === 0) return null;

    return (
        <div
            className="tk-table-footer"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
            }}
        >
            <div className="tk-footer-badges">
                {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                    if (key === 'Fermé') return null;

                    return (
                        <span
                            key={key}
                            className="tk-footer-badge"
                            style={{
                                color: cfg.color,
                                background: cfg.bg,
                                borderColor: cfg.border,
                            }}
                        >
                            <span
                                className="tk-status-dot"
                                style={{ background: cfg.color }}
                            />
                            {tickets.filter((t) => t.status === key).length} {cfg.label}
                        </span>
                    );
                })}
            </div>

            {meta && meta.last_page > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '13px', color: 'var(--dc-text-muted)' }}>
                        Page <strong>{meta.current_page}</strong> sur{' '}
                        <strong>{meta.last_page}</strong>
                        <span style={{ marginLeft: 8 }}>(Total: {meta.total})</span>
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--dc-border)',
                                background: page === 1 ? 'var(--dc-bg)' : 'var(--dc-surface)',
                                color: page === 1 ? 'var(--dc-text-faint)' : 'var(--dc-text)',
                                cursor: page === 1 ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                            }}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 16 }}
                            >
                                chevron_left
                            </span>
                            Précédent
                        </button>
                        <button
                            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                            disabled={page === meta.last_page}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--dc-border)',
                                background:
                                    page === meta.last_page
                                        ? 'var(--dc-bg)'
                                        : 'var(--dc-surface)',
                                color:
                                    page === meta.last_page
                                        ? 'var(--dc-text-faint)'
                                        : 'var(--dc-text)',
                                cursor: page === meta.last_page ? 'not-allowed' : 'pointer',
                                fontSize: '13px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                            }}
                        >
                            Suivant
                            <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 16 }}
                            >
                                chevron_right
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
