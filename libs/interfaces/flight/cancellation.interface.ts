export interface ReleasePNRResponse {
    Response: {
        ResponseStatus: number;
        TraceId: string;
        Error: {
            ErrorCode: number;
            ErrorMessage: string;
        };
    };
}

export interface CancellationChargesResponse {
    Response: {
        ResponseStatus: number;
        TraceId: string;
        RefundAmount: number;
        CancellationCharge: number;
        Remarks: string;
        Currency: string;
    };
}

export interface TicketCRInfo {
    ChangeRequestId: number;
    TicketId?: number;
    Status: number;
    Remarks: string;
    ChangeRequestStatus?: number;
    CancellationCharge?: number;
    RefundedAmount?: number;
    ServiceTaxOnRAF?: number;
    SwachhBharatCess?: number;
    KrishiKalyanCess?: number;
    CreditNoteNo?: string;
    CreditNoteCreatedOn?: string;
}

export interface SendChangeRequestResponse {
    Response: {
        B2B2BStatus: boolean;
        TicketCRInfo: TicketCRInfo[];
        ResponseStatus: number;
        TraceId: string;
    };
}

export interface GetChangeRequestResponse {
    ResponseStatus: number;
    Error: any;
    TraceId: string;
    ChangeRequestId: number;
    RefundedAmount: number;
    CancellationCharge: number;
    ServiceTaxOnRAF: number;
    ChangeRequestStatus: number;
}

export interface CancellationResult {
    success: boolean;
    data: any;
    cancellationCharges?: any;
    changeRequestId?: number;
    refundAmount?: number;
    cancellationCharge?: number;
    error?: string;
}

export interface AirlineType {
    code: string;
    name: string;
    type: 'NDC' | 'LCC' | 'GDS';
}

export interface CancellationRequest {
    bookingId: string;
    requestType: number; // 1: Full, 2: Partial
    cancellationType: number; // 1: Full, 2: Partial, 3: Sector
    sectors?: Array<{
        origin: string;
        destination: string;
    }>;
    ticketIds?: number[];
    remarks?: string;
    userEmail?: string;
} 