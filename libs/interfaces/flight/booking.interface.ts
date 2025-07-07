export interface IPassengerDetails { 
    id?: string,
    passenger_details: [{}],
    user_id?: string,
    title: string,
    first_name: string,
    last_name: string,
    date_of_birth:string,
    age: number,
    gender: string,
    pax_type:string,
    nationality: string,
    passport_issue_date: string,
    passport_expiry_date: string,
    lead_pax: boolean,
    email: string,
    fare: number,
    ticket_id: string,
    flight_type: string,
    pnr_number: string,
    trace_id: string,
    token_id: string
}



export class ITransaction {
    id: string
    transaction_details: string
    transaction_status: string
    transaction_date: string
    transaction_type: string
    transaction_payment_status: string
    transaction_payment_amount: string
    transaction_payment_currency: string
    transaction_payment_date: string
    created_at: Date
    updated_at: Date
}
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
export interface FLIGHT_BOOKING_INPUT {
    reference_id: string;
    order_type: string;
    payload: any;
    amount: number;
    is_LCC: boolean;
    journey: string;
    journey_type: string;
    commtype: string;
    commpercentage: number;
}


export interface FLIGHT_BOOKING_INPUT {
    reference_id: string;
    order_type: string;
    payload: any;
    amount: number;
    is_LCC: boolean;
    journey: string;
    journey_type: string;
    commtype: string;
    commpercentage: number;
}
