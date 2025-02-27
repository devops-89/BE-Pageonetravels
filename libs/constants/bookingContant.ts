export enum BOOKING_STATUS {
    INIT = "INIT",                // Booking initialized but not confirmed
    PENDING = "PENDING",          // Awaiting confirmation or payment
    CONFIRMED = "CONFIRMED",      // Booking successfully confirmed
    CANCELLED = "CANCELLED",      // Booking cancelled by user or admin
    FAILED = "FAILED",            // Booking attempt failed (e.g., payment failure)
    IN_PROGRESS = "IN_PROGRESS",  // Booking currently being processed
    COMPLETED = "COMPLETED",      // Booking successfully completed
    EXPIRED = "EXPIRED",          // Booking expired due to inactivity or timeout
    REFUNDED = "REFUNDED",        // Payment refunded after cancellation or failure
    REJECTED = "REJECTED",        // Booking rejected (e.g., by admin or due to unavailability)
}


export enum ORDER_STATUS {
    INIT = "INIT",                // Booking initialized but not confirmed
    PENDING = "PENDING",          // Awaiting confirmation or payment
    CONFIRMED = "CONFIRMED",      // Booking successfully confirmed
    CANCELLED = "CANCELLED",      // Booking cancelled by user or admin
    FAILED = "FAILED",            // Booking attempt failed (e.g., payment failure)
    IN_PROGRESS = "IN_PROGRESS",  // Booking currently being processed
    COMPLETED = "COMPLETED",      // Booking successfully completed
    EXPIRED = "EXPIRED",          // Booking expired due to inactivity or timeout
    REFUNDED = "REFUNDED",        // Payment refunded after cancellation or failure
    REJECTED = "REJECTED",        // Booking rejected (e.g., by admin or due to unavailability)
}

export enum PAYMENT_STATUS {
    PENDING = "PENDING",          // Payment initiated but not completed
    SUCCESS = "SUCCESS",          // Payment successfully processed
    FAILED = "FAILED",            // Payment failed due to an error
    CANCELLED = "CANCELLED",      // Payment cancelled by the user or system
    REFUNDED = "REFUNDED",        // Payment refunded to the user
    PARTIAL = "PARTIAL",          // Partial payment made
    IN_PROGRESS = "IN_PROGRESS",  // Payment is being processed
    AUTHORIZED = "AUTHORIZED",    // Payment authorized but not captured yet
    DECLINED = "DECLINED",        // Payment declined by the provider or bank
    EXPIRED = "EXPIRED",          // Payment session or authorization expired
}
