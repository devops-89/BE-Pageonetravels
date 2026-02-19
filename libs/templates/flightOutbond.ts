import { LOGO } from '../constants/commonConstants';

export const bookConfirmationTemplate = (bookingData: any, user_name: string) => {
    const response = bookingData.Response.Response;
    const flight = response.FlightItinerary;
    const outboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 1);
    const inboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 2);
    const passengers = flight.Passenger;

    // OUTBOUND Times
    const outDepDate = new Date(outboundSegment.Origin.DepTime).toLocaleDateString('en-IN');
    const outDepTime = new Date(outboundSegment.Origin.DepTime).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit" });
    const outArrDate = new Date(outboundSegment.Destination.ArrTime).toLocaleDateString('en-IN');
    const outArrTime = new Date(outboundSegment.Destination.ArrTime).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit" });

    // INBOUND HTML (kept fully same - only styled)
    let inboundHtml = "";
    if (inboundSegment) {
        const inDepDate = new Date(inboundSegment.Origin.DepTime).toLocaleDateString('en-IN');
        const inDepTime = new Date(inboundSegment.Origin.DepTime).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit" });
        const inArrDate = new Date(inboundSegment.Destination.ArrTime).toLocaleDateString('en-IN');
        const inArrTime = new Date(inboundSegment.Destination.ArrTime).toLocaleTimeString('en-IN', { hour: "2-digit", minute: "2-digit" });

        inboundHtml = `
        <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
            Inbound Flight (Return)
        </div>

        <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
            <thead>
                <tr>
                    <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Departure</th>
                    <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Arrival</th>
                    <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Duration</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        <strong>${inboundSegment.Origin.Airport.AirportName}</strong> (${inboundSegment.Origin.Airport.AirportCode})<br/>
                        ${inDepDate} — <strong>${inDepTime}</strong><br/>
                        Terminal: ${inboundSegment.Origin.Airport.Terminal || "N/A"}
                    </td>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        <strong>${inboundSegment.Destination.Airport.AirportName}</strong> (${inboundSegment.Destination.Airport.AirportCode})<br/>
                        ${inArrDate} — <strong>${inArrTime}</strong><br/>
                        Terminal: ${inboundSegment.Destination.Airport.Terminal || "N/A"}
                    </td>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        ${Math.floor(inboundSegment.Duration / 60)}h ${inboundSegment.Duration % 60}m
                    </td>
                </tr>
            </tbody>
        </table>

        <p style="font-size:15px; margin-top:10px;"><strong>Airline:</strong>
            ${inboundSegment.Airline.AirlineName}
            (${inboundSegment.Airline.AirlineCode} ${inboundSegment.Airline.FlightNumber})
        </p>
        <p style="font-size:15px;"><strong>Booking Status:</strong> ${inboundSegment.Status === "HK" ? "Confirmed" : inboundSegment.Status}</p>
        `;
    }

    const totalFare = flight.Fare.PublishedFare.toFixed(2);

    // FINAL TEMPLATE (FULLY RESTYLED)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Flight Booking Confirmation</title>
</head>

<body style="font-family:Arial, sans-serif; margin:0; padding:0; background:#fff; color:#000;">
<div style="width:800px; margin:40px auto; border:1px solid #000; padding:30px; box-sizing:border-box;">

    <!-- HEADER -->
    <div style="text-align:left; margin-bottom:10px;">
        <img src="${LOGO}" width="200" />
        <hr/>
    </div>

    <!-- TOP DETAILS -->
    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:15px;">
        <div><strong>Booking ID:</strong> ${flight.BookingId}</div>
        <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
    <hr/>

    <!-- TITLE BAR -->
    <div style="width:100%; background:#3b5570; color:#fff; padding:6px 0; text-align:center;
        font-size:16px; font-weight:bold; margin:15px 0 25px 0; text-transform:uppercase;">
        Booking Confirmation
    </div>

    <!-- GREETING -->
    <p style="font-size:15px;"><strong>Dear ${user_name},</strong></p>
    <p style="font-size:15px;">Your flight booking has been confirmed. Please find your itinerary below.</p>

    <!-- OUTBOUND SECTION -->
    <div style="font-weight:bold; font-size:16px; margin-top:20px; text-transform:uppercase; text-decoration:underline;">
        Outbound Flight Details
    </div>

    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
        <thead>
            <tr>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Departure</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Arrival</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Duration</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td style="border:1px solid #000; padding:8px 10px;">
                    <strong>${outboundSegment.Origin.Airport.AirportName}</strong> (${outboundSegment.Origin.Airport.AirportCode})<br/>
                    ${outDepDate} — <strong>${outDepTime}</strong><br/>
                    Terminal: ${outboundSegment.Origin.Airport.Terminal || "N/A"}
                </td>
                <td style="border:1px solid #000; padding:8px 10px;">
                    <strong>${outboundSegment.Destination.Airport.AirportName}</strong> (${outboundSegment.Destination.Airport.AirportCode})<br/>
                    ${outArrDate} — <strong>${outArrTime}</strong><br/>
                    Terminal: ${outboundSegment.Destination.Airport.Terminal || "N/A"}
                </td>
                <td style="border:1px solid #000; padding:8px 10px;">
                    ${Math.floor(outboundSegment.Duration / 60)}h ${outboundSegment.Duration % 60}m
                </td>
            </tr>
        </tbody>
    </table>

    <p style="font-size:15px; margin-top:10px;"><strong>Airline:</strong>
        ${outboundSegment.Airline.AirlineName}
        (${outboundSegment.Airline.AirlineCode} ${outboundSegment.Airline.FlightNumber})
    </p>
    <p style="font-size:15px;"><strong>Booking Status:</strong> ${outboundSegment.Status === "HK" ? "Confirmed" : outboundSegment.Status}</p>

    <!-- INBOUND SECTION (IF AVAILABLE) -->
    ${inboundHtml}

    <!-- PASSENGER DETAILS -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
        Passenger Details
    </div>

    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
        <thead>
            <tr>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Name</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Type</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Ticket No.</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Baggage</th>
            </tr>
        </thead>

        <tbody>
            ${passengers.map(p => `
                <tr>
                    <td style="border:1px solid #000; padding:8px 10px;">${p.Title} ${p.FirstName} ${p.LastName}</td>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        ${p.PaxType === 1 ? "Adult" : p.PaxType === 2 ? "Child" : "Infant"}
                    </td>
                    <td style="border:1px solid #000; padding:8px 10px;">${p.Ticket.TicketNumber}</td>
                    <td style="border:1px solid #000; padding:8px 10px;">${p.SegmentAdditionalInfo[0]?.Baggage || "15 KG"}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <!-- FARE SUMMARY -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
        Fare Summary
    </div>

    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
        <thead>
            <tr>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Description</th>
                <th style="border:1px solid #000; padding:8px 10px; background:#3b5570; color:#fff;">Amount (INR)</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td style="border:1px solid #000; padding:8px 10px;">Base Fare</td>
                <td style="border:1px solid #000; padding:8px 10px;">${flight.Fare.BaseFare.toFixed(2)}</td>
            </tr>

            ${flight.Fare.TaxBreakup.map((tax: any) => `
            <tr>
                <td style="border:1px solid #000; padding:8px 10px;">${tax.key === "TotalTax" ? "Total Taxes" : tax.key}</td>
                <td style="border:1px solid #000; padding:8px 10px;">${tax.value.toFixed(2)}</td>
            </tr>
            `).join('')}

            <tr>
                <td style="border:1px solid #000; padding:8px 10px; font-weight:bold;">Total Amount</td>
                <td style="border:1px solid #000; padding:8px 10px; font-weight:bold;">${totalFare}</td>
            </tr>
        </tbody>
    </table>

    <!-- IMPORTANT INFORMATION -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px;
        text-transform:uppercase; text-decoration:underline;">Important Information</div>

    <ul style="font-size:15px; margin-top:10px;">
        <li>Please arrive at the airport at least 2 hours before departure.</li>
        <li>Carry a valid government ID proof for all passengers.</li>
        <li>Online check-in is recommended.</li>
        ${inboundSegment ? "<li>Please verify your return flight timing carefully.</li>" : ""}
    </ul>

    <hr style="margin-top:30px;"/>

    <!-- FOOTER -->
    <div style="text-align:center; font-size:14px; margin-top:15px;">
        <strong>Need Help?</strong><br/>
        Email: info@page1travels.com<br/>
        Phone: +91 7977512494<br/><br/>
        © ${new Date().getFullYear()} Page1Travels. All Rights Reserved.
    </div>

</div>
</body>
</html>
`;

    return html;
};
