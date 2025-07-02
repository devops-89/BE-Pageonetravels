export const AIRLINE_TYPES = {
    NDC: 'NDC',
    LCC: 'LCC', 
    GDS: 'GDS'
} as const;

export const NDC_AIRLINES = [
    { code: 'EK', name: 'Emirates', type: AIRLINE_TYPES.NDC },
    { code: 'LH', name: 'Lufthansa', type: AIRLINE_TYPES.NDC },
    { code: 'WY', name: 'Oman Air', type: AIRLINE_TYPES.NDC },
    { code: 'EY', name: 'Etihad Airways', type: AIRLINE_TYPES.NDC },
    { code: 'GF', name: 'Gulf Air', type: AIRLINE_TYPES.NDC }
];

export const LCC_AIRLINES = [
    { code: '6E', name: 'IndiGo', type: AIRLINE_TYPES.LCC },
    { code: 'IX', name: 'Air India Express', type: AIRLINE_TYPES.LCC },
    { code: 'SG', name: 'SpiceJet', type: AIRLINE_TYPES.LCC },
    { code: 'FZ', name: 'FlyDubai', type: AIRLINE_TYPES.LCC },
    { code: 'QP', name: 'Akasa Air', type: AIRLINE_TYPES.LCC }
];

export const CANCELLATION_TYPES = {
    FULL: 1,
    PARTIAL: 2,
    SECTOR: 3
} as const;

export const REQUEST_TYPES = {
    FULL_CANCELLATION: 1,
    PARTIAL_CANCELLATION: 2
} as const;

export const BOOKING_MODES = {
    API: '5'
} as const; 