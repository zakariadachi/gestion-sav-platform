import React from 'react';
import { motion } from 'framer-motion';
import { PRIORITIES, PRIORITY_LABELS } from '../constants/enums';
import {
    STATUS_CFG,
    PRIORITY_CFG,
    timeAgo,
    getInitials,
    hashColor,
    fadeIn,
    isOverdue,
    isDueSoon,
    fmt,
    Ticket,
    TicketStatus,
} from '../lib/ticket-helpers';

interface TicketCardProps {
    ticket: Ticket;
    onClick?: (ticket: Ticket) => void;
    actions?: (ticket: Ticket) => React.ReactNode;
}

/**
 * ProgressStepper
 * Private component for TicketCard.
 */
const ProgressStepper = ({ status }: { status: TicketStatus }) => {
    const currentStep = STATUS_CFG[status]?.step ?? 0;
    const steps = [
        { label: 'Soumis', icon: 'check' },
        { label: 'En intervention', icon: 'build' },
        { label: 'Résolu', icon: 'verified' },
    ];

    const progressWidth = currentStep === 0 ? '0%' : currentStep === 1 ? '50%' : '100%';

    return (
        <div className="es-stepper">
            <div className="es-stepper-track" />
            <div className="es-stepper-progress" style={{ width: progressWidth }} />
            {steps.map((step, idx) => {
                const isCompleted = idx < currentStep || currentStep >= 2;
                const isActive = idx === currentStep && currentStep < 2;
                return (
                    <div
                        key={idx}
                        className={`es-stepper-step ${
                            !isCompleted && !isActive ? 'es-step-pending' : ''
                        }`}
                    >
                        <div
                            className={`es-step-circle ${
                                isCompleted ? 'completed' : isActive ? 'active' : 'pending'
                            }`}
                        >
                            {isCompleted && (
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 14 }}
                                >
                                    check
                                </span>
                            )}
                        </div>
                        <span
                            className={`es-step-label ${
                                isCompleted ? 'completed' : isActive ? 'active' : ''
                            }`}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default function TicketCard({ ticket, onClick, actions }: TicketCardProps) {
    const pri = PRIORITY_CFG[ticket.priority] || PRIORITY_CFG[PRIORITIES.MEDIUM];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick && onClick(ticket);
        }
    };

    return (
        <motion.div
            className="es-ticket-card"
            variants={fadeIn}
            role="button"
            tabIndex={0}
            aria-label={`Voir le ticket #${ticket.id} : ${ticket.title}`}
            onClick={() => onClick && onClick(ticket)}
            onKeyDown={handleKeyDown}
        >
            <div className="es-card-top">
                <div>
                    <span className="es-card-id">
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 14, color: '#94a3b8' }}
                        >
                            tag
                        </span>
                        Demande #{ticket.id}
                    </span>
                    <h3 className="es-card-title">{ticket.title}</h3>
                </div>
                <span
                    className="es-priority-pill"
                    style={{
                        background: `color-mix(in srgb, ${pri.color} 8%, transparent)`,
                        color: pri.color,
                        borderColor: `color-mix(in srgb, ${pri.color} 15%, transparent)`,
                    }}
                >
                    {pri.icon && (
                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            {pri.icon}
                        </span>
                    )}
                    {PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS[PRIORITIES.MEDIUM]}
                </span>
            </div>

            {ticket.due_date && (
                <div style={{ padding: '0 20px', marginTop: '-4px', marginBottom: '12px' }}>
                    <span 
                        className="tk-priority-badge" 
                        style={{
                            display: 'inline-flex',
                            fontSize: '11px',
                            padding: '4px 8px',
                            color: isOverdue(ticket) ? '#ef4444' : isDueSoon(ticket) ? '#f59e0b' : '#6b7280',
                            background: isOverdue(ticket) ? 'rgba(239, 68, 68, 0.1)' : isDueSoon(ticket) ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            borderColor: isOverdue(ticket) ? 'rgba(239, 68, 68, 0.3)' : isDueSoon(ticket) ? 'rgba(245, 158, 11, 0.3)' : 'rgba(107, 114, 128, 0.2)',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderRadius: '99px',
                            fontWeight: 600,
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        {isOverdue(ticket) && <span className="material-symbols-outlined" style={{ fontSize: 13 }}>warning</span>}
                        {isDueSoon(ticket) && !isOverdue(ticket) && <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>}
                        Échéance : {fmt(ticket.due_date)}
                    </span>
                </div>
            )}

            <ProgressStepper status={ticket.status} />

            <div className="es-card-footer">
                {ticket.technician ? (
                    <div className="es-card-tech">
                        <div
                            className="es-tech-avatar"
                            style={(() => {
                                const c = hashColor(ticket.technician.name);
                                return { background: c.bg, color: c.text };
                            })()}
                        >
                            {getInitials(ticket.technician.name)}
                        </div>
                        <span>{ticket.technician.name}</span>
                    </div>
                ) : (
                    <span className="es-card-unassigned">En attente d'assignation</span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {actions && (
                        <div onClick={(e) => e.stopPropagation()}>{actions(ticket)}</div>
                    )}
                    <span className="es-card-time">{timeAgo(ticket.created_at)}</span>
                </div>
            </div>
        </motion.div>
    );
}
