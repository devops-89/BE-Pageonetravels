import { LOGO } from '../constants/commonConstants';

export const bookingConTemplate = (bookingData: any, user_name: string) => {
    const response = bookingData.Response.Response;
    const flight = response.FlightItinerary;
    const totalSSRCharges: number = flight.Fare.TotalBaggageCharges + flight.Fare.TotalMealCharges + flight.Fare.TotalSeatCharges;
    const convenienceCharge = Number(flight.Fare.OtherCharges) + Number(flight.Fare.ServiceFee) + Number(flight.Fare.AdditionalTxnFeePub);
    const outboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 1);
    const inboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 2);
    const passengers = flight.Passenger;

    // OUTBOUND Time formatting
    const outDepDate = new Date(outboundSegment.Origin.DepTime).toLocaleDateString();
    const outDepTime = new Date(outboundSegment.Origin.DepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const outArrDate = new Date(outboundSegment.Destination.ArrTime).toLocaleDateString();
    const outArrTime = new Date(outboundSegment.Destination.ArrTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // RETURN (if exists)
    let inboundHtml = '';
    if (inboundSegment) {
        const inDepDate = new Date(inboundSegment.Origin.DepTime).toLocaleDateString();
        const inDepTime = new Date(inboundSegment.Origin.DepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const inArrDate = new Date(inboundSegment.Destination.ArrTime).toLocaleDateString();
        const inArrTime = new Date(inboundSegment.Destination.ArrTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        inboundHtml = `
        <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
            Return Flight Details
        </div>

        <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
            <thead>
                <tr>
                    <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Departure</th>
                    <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Arrival</th>
                    <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Duration</th>
                </tr>
            </thead>

            <tbody>
                <tr>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        <strong>${inboundSegment.Origin.Airport.AirportName}</strong> (${inboundSegment.Origin.Airport.AirportCode})<br>
                        ${inDepDate} — <strong>${inDepTime}</strong><br>
                        Terminal: ${inboundSegment.Origin.Airport.Terminal}
                    </td>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        <strong>${inboundSegment.Destination.Airport.AirportName}</strong> (${inboundSegment.Destination.Airport.AirportCode})<br>
                        ${inArrDate} — <strong>${inArrTime}</strong><br>
                        Terminal: ${inboundSegment.Destination.Airport.Terminal}
                    </td>
                    <td style="border:1px solid #000; padding:8px 10px;">
                        ${Math.floor(inboundSegment.Duration / 60)}h ${inboundSegment.Duration % 60}m
                    </td>
                </tr>
            </tbody>
        </table>

        <p style="font-size:15px; margin-top:10px;"><strong>Airline:</strong>
        ${inboundSegment.Airline.AirlineName}
        (${inboundSegment.Airline.AirlineCode} ${inboundSegment.Airline.FlightNumber})</p>
        `;
    }

    // Total Fare
    const totalFare = flight.Fare.PublishedFare.toFixed(2);


    // FINAL TEMPLATE (converted)
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Flight Booking Confirmation</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color:#fff; color:#000;">
<div style="width: 800px; margin: 40px auto; border: 1px solid #000; padding: 30px; box-sizing: border-box;">

    <!-- HEADER -->
    <div style="text-align:left; margin-bottom:10px;">
        <img src="${LOGO}" width="200" />
        <hr>
    </div>

    <!-- TOP ROW -->
    <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:15px;">
        <div><strong>Booking ID:</strong> ${flight.BookingId}</div>
        <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
    <hr>

    <!-- HEADING -->
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
                    <strong>${outboundSegment.Origin.Airport.AirportName}</strong> (${outboundSegment.Origin.Airport.AirportCode})<br>
                    ${outDepDate} — <strong>${outDepTime}</strong><br>
                    Terminal: ${outboundSegment.Origin.Airport.Terminal}
                </td>

                <td style="border:1px solid #000; padding:8px 10px;">
                    <strong>${outboundSegment.Destination.Airport.AirportName}</strong> (${outboundSegment.Destination.Airport.AirportCode})<br>
                    ${outArrDate} — <strong>${outArrTime}</strong><br>
                    Terminal: ${outboundSegment.Destination.Airport.Terminal}
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

    <!-- RETURN SECTION IF EXISTS -->
    ${inboundHtml}

    <!-- PASSENGERS -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px;
        text-transform:uppercase; text-decoration:underline;">Passenger Details</div>

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
                    <td style="border:1px solid #000; padding:8px 10px;">${p.SegmentAdditionalInfo[0].Baggage}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>


    <!-- FARE SUMMARY -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px;
        text-transform:uppercase; text-decoration:underline;">Fare Summary</div>

    <table style="width:100%; border-collapse:collapse; margin-top:15px; font-size:15px;">
        <tbody>
            <tr>
                <td style="border:1px solid #000; padding:8px 10px;"><strong>Base Fare:</strong></td>
                <td style="border:1px solid #000; padding:8px 10px;">₹${flight.Fare.BaseFare.toFixed(2)}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000; padding:8px 10px;"><strong>Taxes & Fees:</strong></td>
                <td style="border:1px solid #000; padding:8px 10px;">₹${flight.Fare.Tax.toFixed(2)}</td>
            </tr>

            <tr>
            <td style="border:1px solid #000; padding:8px 10px;"><strong>Convenience Fee:</strong></td>
            <td style="border:1px solid #000; padding:8px 10px;">₹${convenienceCharge.toFixed(2)}</td>
          </tr>

           <tr>
            <td style="border:1px solid #000; padding:8px 10px;"><strong>Add-ons (Meal + Seat + Baggage):</strong></td>
            <td style="border:1px solid #000; padding:8px 10px;">₹${totalSSRCharges.toFixed(2)}</td>
          </tr>

            <tr>
                <td style="border:1px solid #000; padding:8px 10px;"><strong>Total Fare:</strong></td>
                <td style="border:1px solid #000; padding:8px 10px; font-weight:bold;">
                    ₹${totalFare}
                </td>
            </tr>
        </tbody>
    </table>

    <!-- IMPORTANT INFO -->
    <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
        Important Information
    </div>

    <ul style="font-size:15px; margin-top:10px;">
        <li>Please arrive at the airport at least 2 hours before departure.</li>
        <li>Carry a valid government ID proof for all passengers.</li>
        <li>Online check-in is recommended for a smooth travel experience.</li>
        ${inboundSegment ? "<li>Please verify your return flight timing carefully.</li>" : ""}
    </ul>

    <hr style="margin-top:30px;">

    <div style="text-align:center; font-size:14px; margin-top:15px;">
        <strong>Need Help?</strong><br>
        Email: info@page1travels.com<br>
        Phone: +91 7977512494<br><br>
        © ${new Date().getFullYear()} Page1Travels. All Rights Reserved.
    </div>

</div>
</body>
</html>
`;

    return html;
};
