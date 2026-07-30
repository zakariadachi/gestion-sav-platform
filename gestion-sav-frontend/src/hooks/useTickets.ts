import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import api from '../services/api';
import { TICKET_STATUS } from '../constants/enums';
import { Ticket, ULID, User } from '../lib/ticket-helpers';

// Interfaces for API responses
export interface Meta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: Meta;
}

export interface SingleResponse<T> {
    data: T;
}

interface AxiosErrorResponse {
    message?: string;
}

interface CustomAxiosError {
    response?: {
        data?: AxiosErrorResponse;
    };
}

const useTickets = (user?: User | null) => {
    const queryClient = useQueryClient();

    // Local filters state
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [filterStatut, setFilterStatut] = useState<string>('Tous');
    const [filterPriorite, setFilterPriorite] = useState<string>('Tous');

    // Technicians (Only fetch if Admin)
    const { data: techniciansResponse } = useQuery<SingleResponse<User[]> | User[]>({
        queryKey: ['technicians'],
        queryFn: () => api.get('/technicians').then((r) => r.data),
        enabled: user?.role === 'Admin',
    });
    
    // Extract array safely
    const technicians: User[] = (techniciansResponse && 'data' in techniciansResponse && Array.isArray(techniciansResponse.data)) 
        ? techniciansResponse.data 
        : (Array.isArray(techniciansResponse) ? techniciansResponse : []);

    // Reset page to 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [search, filterStatut, filterPriorite]);

    // Fetch Tickets Query
    const queryKey = ['tickets', { page, search, filterStatut, filterPriorite }] as const;
    
    const { 
        data: ticketsResponse, 
        isLoading: loading, 
        isError
    } = useQuery<PaginatedResponse<Ticket>>({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({ page: page.toString() });
            if (search) params.set('search', search);
            if (filterStatut !== 'Tous') params.set('status', filterStatut);
            if (filterPriorite !== 'Tous') params.set('priority', filterPriorite);
            
            const { data } = await api.get(`/tickets?${params.toString()}`);
            return data as PaginatedResponse<Ticket>;
        },
        placeholderData: keepPreviousData,
    });

    const tickets: Ticket[] = ticketsResponse?.data ?? [];
    const meta: Meta | null = ticketsResponse?.meta ?? null;
    const error: string = isError ? 'Impossible de charger les tickets.' : '';

    // Legacy "filtered" map
    const filtered: Ticket[] = tickets;

    // Toast State
    const [toast, setToast] = useState<string>('');
    const showToast = useCallback((msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 4000);
    }, []);

    const [updatingStatusId, setUpdatingStatusId] = useState<ULID | null>(null);

    // Optimistic Mutation Context Type
    interface MutationContext {
        previousData: PaginatedResponse<Ticket> | undefined;
        queryKey: typeof queryKey;
    }

    // Optimistic Mutation
    const resolveMutation = useMutation<SingleResponse<Ticket>, CustomAxiosError, ULID, MutationContext>({
        mutationFn: async (ticketId: ULID) => {
            const { data } = await api.patch(`/tickets/${ticketId}/status`, { status: TICKET_STATUS.RESOLVED });
            return data;
        },
        onMutate: async (ticketId: ULID) => {
            setUpdatingStatusId(ticketId);
            
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['tickets'] });

            const previousData = queryClient.getQueryData<PaginatedResponse<Ticket>>(queryKey);

            // Optimistically update
            queryClient.setQueryData<PaginatedResponse<Ticket>>(queryKey, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    data: old.data.map(t => t.id === ticketId ? { ...t, status: TICKET_STATUS.RESOLVED as any } : t)
                };
            });

            return { previousData, queryKey };
        },
        onError: (err, ticketId, context) => {
            // Rollback
            if (context?.previousData) {
                queryClient.setQueryData(context.queryKey, context.previousData);
            }
            showToast(`✗ ${err.response?.data?.message ?? 'Erreur lors de la mise à jour.'}`);
            setUpdatingStatusId(null);
        },
        onSettled: () => {
            // Sync with server
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
        onSuccess: (_, ticketId) => {
            showToast(`✓ Ticket #${ticketId} marqué comme Résolu`);
            setUpdatingStatusId(null);
        }
    });

    const handleResolve = (ticket: Ticket) => {
        if (updatingStatusId) return;
        resolveMutation.mutate(ticket.id);
    };

    // To prevent API breaks in older components
    const setTickets = useCallback((updater: Ticket[] | ((prev: Ticket[]) => Ticket[])) => {
        queryClient.setQueryData<PaginatedResponse<Ticket>>(queryKey, (old) => {
            if (!old) return old;
            const prevArray = old.data || [];
            const newArray = typeof updater === 'function' ? updater(prevArray) : updater;
            return { ...old, data: newArray };
        });
    }, [queryClient, queryKey]);

    const fetchTickets = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
    }, [queryClient]);

    return {
        tickets, setTickets,
        meta,
        page, setPage,
        loading,
        error, fetchTickets,
        search, setSearch,
        filterStatut, setFilterStatut,
        filterPriorite, setFilterPriorite,
        filtered,
        technicians,
        toast, setToast, showToast,
        updatingStatusId, handleResolve
    };
};

export { useTickets };
