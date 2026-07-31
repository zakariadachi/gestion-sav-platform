import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { TICKET_STATUS } from '../../constants/enums';
import SharedTicketDrawer from '../SharedTicketDrawer';
import RapportModal from './RapportModal';
import AssignModal from './AssignModal';
import CreateTicketModal from './CreateTicketModal';
import { Ticket, User, ULID } from '../../lib/ticket-helpers';

interface TicketModalsProps {
    user?: User | null;
    viewTicket: Ticket | null;
    setViewTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
    rapportModal: Ticket | null;
    setRapportModal: React.Dispatch<React.SetStateAction<Ticket | null>>;
    assignModal: Ticket | null;
    setAssignModal: React.Dispatch<React.SetStateAction<Ticket | null>>;
    modalOpen: boolean;
    setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    technicians: User[];
    updatingStatusId?: ULID | null;
    handleResolve: (ticket: Ticket) => void;
    setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
    showToast: (msg: string) => void;
}

/**
 * TicketModals
 *
 * Orchestrator for all ticket-related overlays.
 * Wraps existing modals in AnimatePresence and passes down state/callbacks.
 */
export default function TicketModals({
    user,
    viewTicket, setViewTicket,
    rapportModal, setRapportModal,
    assignModal, setAssignModal,
    modalOpen, setModalOpen,
    technicians,
    updatingStatusId,
    handleResolve,
    setTickets,
    showToast,
}: TicketModalsProps) {
    return (
        <>
            {/* ══ DETAIL DRAWER ══ */}
            <AnimatePresence>
                {viewTicket && (
                    <SharedTicketDrawer
                        ticket={viewTicket}
                        currentUser={user}
                        onClose={() => setViewTicket(null)}
                        onAssign={(ticket: Ticket) => {
                            setViewTicket(null);
                            setAssignModal(ticket);
                        }}
                        onResolve={(ticket: Ticket) => {
                            setViewTicket(null);
                            handleResolve(ticket);
                        }}
                        onRapport={(ticket: Ticket) => {
                            setViewTicket(null);
                            setRapportModal(ticket);
                        }}
                        isResolving={updatingStatusId === viewTicket?.id}
                    />
                )}
            </AnimatePresence>

            {/* ══ RAPPORT MODAL ══ */}
            <AnimatePresence>
                {rapportModal && (
                    <RapportModal
                        ticket={rapportModal}
                        onClose={() => setRapportModal(null)}
                        onSuccess={(ticketId: ULID) => {
                            setTickets((prev) =>
                                prev.map((t) =>
                                    t.id === ticketId
                                        ? { ...t, status: TICKET_STATUS.RESOLVED as any }
                                        : t
                                )
                            );
                            setRapportModal(null);
                            showToast('Rapport soumis et ticket clôturé avec succès !');
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ══ ASSIGN MODAL ══ */}
            <AnimatePresence>
                {assignModal && (
                    <AssignModal
                        ticket={assignModal}
                        technicians={technicians}
                        onClose={() => setAssignModal(null)}
                        onSuccess={(updated: Ticket, tech: User) => {
                            setTickets((prev) =>
                                prev.map((t) => (t.id === updated.id ? updated : t))
                            );
                            setAssignModal(null);
                            showToast(
                                `✓ Ticket #${updated.id} assigné à ${
                                    tech?.name ?? 'technicien'
                                }`
                            );
                        }}
                    />
                )}
            </AnimatePresence>

            {/* ══ CREATE TICKET MODAL ══ */}
            <AnimatePresence>
                {modalOpen && (
                    <CreateTicketModal
                        onClose={() => setModalOpen(false)}
                        onSuccess={(newTicket: Ticket) => {
                            setTickets((prev) => [newTicket, ...prev]);
                            setModalOpen(false);
                            showToast('Ticket créé avec succès !');
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
