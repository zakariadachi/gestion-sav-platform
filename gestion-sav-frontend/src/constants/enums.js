export const ROLES = {
    ADMIN: 'Admin',
    CLIENT: 'Client',
    TECHNICIAN: 'Technician'
};

export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CLIENT]: 'Client',
    [ROLES.TECHNICIAN]: 'Technicien'
};

export const TICKET_STATUS = {
    NEW:         'New',
    IN_PROGRESS: 'In_Progress',
    RESOLVED:    'Resolved',
};

export const TICKET_STATUS_LABELS = {
    [TICKET_STATUS.NEW]:         'Nouveau',
    [TICKET_STATUS.IN_PROGRESS]: 'En cours',
    [TICKET_STATUS.RESOLVED]:    'Résolu',
};

export const PRIORITIES = {
    LOW:      'Low',
    MEDIUM:   'Medium',
    HIGH:     'High',
    CRITICAL: 'Critical',
};

export const PRIORITY_LABELS = {
    [PRIORITIES.LOW]:      'Basse',
    [PRIORITIES.MEDIUM]:   'Moyenne',
    [PRIORITIES.HIGH]:     'Haute',
    [PRIORITIES.CRITICAL]: 'Critique',
};
