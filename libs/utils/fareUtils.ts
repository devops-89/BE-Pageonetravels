// Function to calculate per-passenger fare
export const calculateFare = (passengerType: number, fareBreakdown: any[], fare: any[]) => {
    const breakdown = fareBreakdown.find(item => item.PassengerType === passengerType);
    if (!breakdown) return null;

    const baseFare = breakdown.BaseFare / breakdown.PassengerCount;
    const tax = breakdown.Tax / breakdown.PassengerCount;
    const fareDetails = fare[0]; // Assuming first fare object is used

    return {
        Currency: fareDetails.Currency,
        BaseFare: baseFare,
        Tax: tax,
        YQTax: fareDetails.YQTax,
        AdditionalTxnFeePub: fareDetails.AdditionalTxnFeePub,
        AdditionalTxnFeeOfrd: fareDetails.AdditionalTxnFeeOfrd,
        OtherCharges: fareDetails.OtherCharges,
        Discount: fareDetails.Discount,
        PublishedFare: fareDetails.PublishedFare,
        OfferedFare: fareDetails.OfferedFare,
        TdsOnCommission: fareDetails.TdsOnCommission,
        TdsOnPLB: fareDetails.TdsOnPLB,
        TdsOnIncentive: fareDetails.TdsOnIncentive,
        ServiceFee: fareDetails.ServiceFee
    };
};

// Function to process passengers
export const processPassengers = (
    passengerList: any[],
    paxType: number,
    fareBreakdown: any[],
    fare: any[],
    additionalInfo: any
) => {
    const calculatedFare = calculateFare(paxType, fareBreakdown, fare);
    if (!calculatedFare) return [];

    return passengerList.map(passenger => ({
        Title: passenger.title,
        FirstName: passenger.first_name,
        LastName: passenger.last_name,
        PaxType: paxType,
        DateOfBirth: passenger.date_of_birth ? `${passenger.date_of_birth}T00:00:00` : "",
        Gender: passenger.gender === "Male" ? 1 : 2,
        PassportNo: passenger.passport_no || "",
        PassportExpiry: passenger.passport_expiry ? `${passenger.passport_expiry}T00:00:00` : "",
        PassportIssueDate:passenger.passport_issue_date? `${passenger.passport_issue_date}T00:00:00` : "",
        PassportIssueCountryCode:passenger.passport_issue_country_code? passenger.passport_issue_country_code : "",
        AddressLine1: additionalInfo.address,
        AddressLine2: "",
        Fare: calculatedFare,
        City: additionalInfo.city,
        CountryCode: additionalInfo.nationality,
        CellCountryCode: additionalInfo.cell_country_code,
        ContactNo: passenger.contact_no,
        Nationality: additionalInfo.nationality,
        Email: passenger.email,
        IsLeadPax: passenger.is_lead_pax,
        FFAirlineCode: passenger.ff_airline_code || null,
        FFNumber: passenger.ff_number || "",
        GSTCompanyAddress: additionalInfo.gst_company_address || "",
        GSTCompanyContactNumber: additionalInfo.gst_company_contact_number || "",
        GSTCompanyName: additionalInfo.gst_company_name || "",
        GSTNumber: additionalInfo.gst_number || "",
        GSTCompanyEmail: additionalInfo.gst_company_email || ""
    }));
};


export const procesPassengers = (
    passengerList: any[],
    paxType: number,
    fareBreakdown: any[],
    fare: any[],
    additionalData: any
) => {
    const calculateFare = (passengerType: number) => {
        const breakdown = fareBreakdown.find(item => item.PassengerType === passengerType);
        if (!breakdown) return null;
        const baseFare = breakdown.BaseFare / breakdown.PassengerCount;
        const tax = breakdown.Tax / breakdown.PassengerCount;
        const fareDetails = fare[0]; // Assuming first fare object is used
        return {
            Currency: fareDetails.Currency,
            BaseFare: baseFare,
            Tax: tax,
            YQTax: fareDetails.YQTax,
            AdditionalTxnFeePub: fareDetails.AdditionalTxnFeePub,
            AdditionalTxnFeeOfrd: fareDetails.AdditionalTxnFeeOfrd,
            OtherCharges: fareDetails.OtherCharges,
            Discount: fareDetails.Discount,
            PublishedFare: fareDetails.PublishedFare,
            OfferedFare: fareDetails.OfferedFare,
            TdsOnCommission: fareDetails.TdsOnCommission,
            TdsOnPLB: fareDetails.TdsOnPLB,
            TdsOnIncentive: fareDetails.TdsOnIncentive,
            ServiceFee: fareDetails.ServiceFee
        };
    };

    const calculatedFare = calculateFare(paxType);
    if (!calculatedFare) return [];

    return passengerList.map(passenger => {
        // Create the base passenger object
        const passengerData: any = {
            Title: passenger.title,
            FirstName: passenger.first_name,
            LastName: passenger.last_name,
            PaxType: paxType,
            DateOfBirth: passenger.date_of_birth ? `${passenger.date_of_birth}T00:00:00` : "",
            Gender: passenger.gender === "Male" ? 1 : 2,
            PassportNo: passenger.passport_no || "",
            PassportExpiry: passenger.passport_expiry ? `${passenger.passport_expiry}T00:00:00` : "",
            AddressLine1: additionalData.address,
            AddressLine2: "",
            Fare: calculatedFare,
            City: additionalData.city,
            CountryCode: additionalData.nationality,
            CountryName:additionalData.country,
            ContactNo: passenger.contact_no,
            Nationality: additionalData.nationality,
            Email: passenger.email,
            IsLeadPax: passenger.is_lead_pax,
            FFAirlineCode: passenger.ff_airline_code || null,
            FFNumber: passenger.ff_number || "",
            GSTCompanyAddress: additionalData.gst_company_address || "",
            GSTCompanyContactNumber: additionalData.gst_company_contact_number || "",
            GSTCompanyName: additionalData.gst_company_name || "",
            GSTNumber: additionalData.gst_number || "",
            GSTCompanyEmail: additionalData.gst_company_email || ""
        };

        // Conditionally add Baggage, MealDynamic, and SeatDynamic if they exist
        if (passenger.Baggage) {
            passengerData.Baggage = passenger.Baggage;
        }
        if (passenger.MealDynamic) {
            passengerData.MealDynamic = passenger.MealDynamic;
        }
        if (passenger.SeatDynamic) {
            passengerData.SeatDynamic = passenger.SeatDynamic;
        }

        return passengerData;
    });
};




