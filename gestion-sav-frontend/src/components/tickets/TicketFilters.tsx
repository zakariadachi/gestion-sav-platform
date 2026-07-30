import React from 'react';
import { motion } from 'framer-motion';
import {
    TICKET_STATUS,
    TICKET_STATUS_LABELS,
    PRIORITIES,
    PRIORITY_LABELS,
} from '../../constants/enums';
import { fadeIn } from '../../lib/ticket-helpers';

interface TicketFiltersProps {
    filterStatut: string;
    setFilterStatut: React.Dispatch<React.SetStateAction<string>>;
    filterPriorite: string;
    setFilterPriorite: React.Dispatch<React.SetStateAction<string>>;
    search: string;
    setSearch: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * TicketFilters
 *
 * Renders the filter bar below the page header:
 * status dropdown, priority dropdown, reset button, and API status badge.
 */
export default function TicketFilters({
    filterStatut,
    setFilterStatut,
    filterPriorite,
    setFilterPriorite,
    search,
    setSearch,
}: TicketFiltersProps) {
    const hasActiveFilters = filterStatut !== 'Tous' || filterPriorite !== 'Tous' || search !== '';

    const resetAll = () => {
        setSearch('');
        setFilterStatut('Tous');
        setFilterPriorite('Tous');
    };

    return (
        <motion.div className="tk-filter-bar" variants={fadeIn}>
            <div className="tk-filter-left">
                <div className="tk-filter-icon">
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: 16 }}
                    >
                        filter_list
                    </span>
                    <span>Filtres</span>
                </div>

                <select
                    value={filterStatut}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatut(e.target.value)}
                    className="tk-select"
                    aria-label="Filtrer par statut"
                >
                    <option value="Tous">Tous</option>
                    {Object.values(TICKET_STATUS).map((v) => (
                        <option key={v as string} value={v as string}>
                            {TICKET_STATUS_LABELS[v as keyof typeof TICKET_STATUS_LABELS]}
                        </option>
                    ))}
                </select>

                <select
                    value={filterPriorite}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterPriorite(e.target.value)}
                    className="tk-select"
                    aria-label="Filtrer par priorité"
                >
                    <option value="Tous">Tous</option>
                    {Object.values(PRIORITIES).map((v) => (
                        <option key={v as string} value={v as string}>
                            {PRIORITY_LABELS[v as keyof typeof PRIORITY_LABELS]}
                        </option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button onClick={resetAll} className="tk-btn-reset">
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: 15 }}
                        >
                            close
                        </span>
                        Réinitialiser
                    </button>
                )}
            </div>

            <div className="tk-api-badge">
                <span className="tk-api-dot" />
                API connectée
            </div>
        </motion.div>
    );
}
