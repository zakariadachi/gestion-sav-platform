import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { useTickets } from '../hooks/useTickets';
import AppLayout from '../components/AppLayout';

import TicketFilters from '../components/tickets/TicketFilters';
import TicketTable from '../components/tickets/TicketTable';
import TicketMobileList from '../components/tickets/TicketMobileList';
import TicketPagination from '../components/tickets/TicketPagination';
import TicketModals from '../components/tickets/TicketModals';
import TicketToast from '../components/tickets/TicketToast';
import { Ticket } from '../lib/ticket-helpers';
import api from '../services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Tickets (Page Orchestrator)
 *
 * Thin container component that fetches data via `useTickets`,
 * manages modal state, and composes the page layout.
 *
 * Contains ZERO rendering logic for tables, lists, or modals.
 */
export default function Tickets() {
    const { user } = useAuth();
    const {
        tickets,
        setTickets,
        meta,
        page,
        setPage,
        loading,
        error,
        search,
        setSearch,
        filterStatut,
        setFilterStatut,
        filterPriorite,
        setFilterPriorite,
        filtered,
        technicians,
        toast,
        setToast,
        showToast,
        updatingStatusId,
        handleResolve,
    } = useTickets(user);

    // Modal state
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [assignModal, setAssignModal] = useState<Ticket | null>(null);
    const [rapportModal, setRapportModal] = useState<Ticket | null>(null);
    const [viewTicket, setViewTicket] = useState<Ticket | null>(null);
    const [deleteModal, setDeleteModal] = useState<Ticket | null>(null);

    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string | number) => api.delete(`/tickets/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            showToast('✓ Ticket supprimé avec succès');
            setDeleteModal(null);
        },
        onError: () => {
            showToast('✗ Erreur lors de la suppression du ticket');
        }
    });

    // If client tries to access tech/admin tickets page, bounce them.
    if (user?.role?.toLowerCase() === 'client') return <Navigate to="/client" replace />;

    return (
        <>
            <AppLayout
                title="Gestion des Tickets"
                subtitle={
                    loading
                        ? '…'
                        : `${filtered.length} ticket${
                              filtered.length !== 1 ? 's' : ''
                          } trouvé${filtered.length !== 1 ? 's' : ''}`
                }
                actions={
                    <div className="tk-header-actions">
                        <div className="tk-search-box">
                            <span className="material-symbols-outlined tk-search-icon">
                                search
                            </span>
                            <input
                                value={search}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                                placeholder="Rechercher un ticket…"
                            />
                        </div>
                        {user?.role === 'Client' && (
                            <button
                                onClick={() => setModalOpen(true)}
                                className="tk-btn-create"
                            >
                                <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: 16 }}
                                >
                                    add
                                </span>
                                Nouveau Ticket
                            </button>
                        )}
                    </div>
                }
            >
                <motion.div
                    className="tk-page"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                >
                    <TicketFilters
                        filterStatut={filterStatut}
                        setFilterStatut={setFilterStatut}
                        filterPriorite={filterPriorite}
                        setFilterPriorite={setFilterPriorite}
                        search={search}
                        setSearch={setSearch}
                    />

                    <motion.div
                        className="tk-table-card"
                        variants={{
                            hidden: { opacity: 0, y: 16 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                            },
                        }}
                    >
                        <TicketTable
                            tickets={filtered}
                            loading={loading}
                            user={user}
                            updatingStatusId={updatingStatusId}
                            onView={setViewTicket}
                            onAssign={setAssignModal}
                            onResolve={handleResolve}
                            onRapport={setRapportModal}
                            onDelete={setDeleteModal}
                        />

                        <div className="dc-show-mobile">
                            <TicketMobileList
                                tickets={filtered}
                                loading={loading}
                                user={user}
                                updatingStatusId={updatingStatusId}
                                onView={setViewTicket}
                                onAssign={setAssignModal}
                                onResolve={handleResolve}
                                onRapport={setRapportModal}
                                onDelete={setDeleteModal}
                            />
                        </div>

                        <TicketPagination
                            tickets={filtered}
                            meta={meta}
                            page={page}
                            setPage={setPage}
                        />
                    </motion.div>
                </motion.div>

                <TicketModals
                    user={user}
                    viewTicket={viewTicket}
                    setViewTicket={setViewTicket}
                    rapportModal={rapportModal}
                    setRapportModal={setRapportModal}
                    assignModal={assignModal}
                    setAssignModal={setAssignModal}
                    modalOpen={modalOpen}
                    setModalOpen={setModalOpen}
                    technicians={technicians}
                    updatingStatusId={updatingStatusId}
                    handleResolve={handleResolve}
                    setTickets={setTickets as React.Dispatch<React.SetStateAction<Ticket[]>>}
                    showToast={showToast}
                />

                <TicketToast toast={toast} setToast={setToast} />

                {deleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-sm p-6 overflow-hidden">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Supprimer le ticket</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-zinc-400 mb-6">
                                Êtes-vous sûr de vouloir supprimer le ticket <span className="font-bold">#{deleteModal.id}</span> ? Cette action est irréversible.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(deleteModal.id)}
                                    disabled={deleteMutation.isPending}
                                    className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                                >
                                    {deleteMutation.isPending ? (
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                    )}
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AppLayout>
        </>
    );
}
