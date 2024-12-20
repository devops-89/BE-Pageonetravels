
export enum ORDER_STATUS {
    INITIATED = 'INITIATED',
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    RETURNED = 'RETURNED',
}

export enum PAYMENT_STATUS {
    INITIATED = 'INITIATED',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    FAILED = 'FAILED'
}

export enum PAYMENT_METHOD {
    PAYPAL = 'PAYPAL',
    STRIPE = 'STRIPE',
}

export enum PAYMENT_INTENT {
    Payer = 'payer',
    Sale = 'sale',
    Authorize = 'Authorize',
}

export enum PAYMENT_GATEWAY_STATUS {
    Approved = 'approved',
}