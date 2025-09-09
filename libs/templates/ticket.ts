export const flightTicketPdfTemplate = (data:any) => {
    // Extract data from the static response
    const flightData = data?.Response?.Response?.FlightItinerary;
    const segment = flightData?.Segments?.[0];
    const airline = segment.Airline;
    const fare = flightData.Fare;
    const passengers = flightData.Passenger;
    const primaryPassenger = passengers[0];

    // Helper function to format dates
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Helper function to format times
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    // Format currency
    const numberFormat = (num: number, decimals: number) => 
        num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Flight Ticket</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .ticket-container { width: 700px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .section-title { background-color: #2051a0; color: white; padding: 8px; font-weight: bold; margin: 15px 0 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
        .airline-info { display: flex; align-items: center; gap: 10px; }
        .airline-logo { max-width: 40px; }
        .total-row { font-weight: bold; border-top: 2px solid #333; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #555; }
        .notes { font-size: 12px; padding-left: 15px; }
        .notes li { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="ticket-container">
        <!-- Header Section -->
        <div class="header">
            <div>
                <img src="https://your-logo-url.com/logo.png" width="120" alt="Company Logo">
            </div>
            <div>
                <h2>E-TICKET RECEIPT</h2>
            </div>
            <div>
                <p><strong>PNR:</strong> ${flightData.PNR}</p>
                <p><strong>Booking ID:</strong> ${data.Response.Response.BookingId}</p>
                <p><strong>Issue Date:</strong> ${formatDate(primaryPassenger.Ticket.IssueDate)}</p>
            </div>
        </div>

        <!-- Passenger Information -->
        <div class="section-title">PASSENGER INFORMATION</div>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Ticket Number</th>
                    <th>Baggage</th>
                </tr>
            </thead>
            <tbody>
                ${passengers.map(pax => `
                <tr>
                    <td>${pax.Title}. ${pax.FirstName} ${pax.LastName}</td>
                    <td>${pax.PaxType === 1 ? 'Adult' : pax.PaxType === 2 ? 'Child' : 'Infant'}</td>
                    <td>${pax.Ticket.TicketNumber || 'Not Issued'}</td>
                    <td>${segment.Baggage}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <!-- Flight Information -->
        <div class="section-title">FLIGHT INFORMATION</div>
        <table>
            <thead>
                <tr>
                    <th>Flight</th>
                    <th>Departure</th>
                    <th>Arrival</th>
                    <th>Duration</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="airline-info">
                            <img src="https://airline-logo-url.com/${airline.AirlineCode}.png" 
                                 alt="${airline.AirlineName}" class="airline-logo">
                            <div>
                                ${airline.AirlineName}<br>
                                ${airline.AirlineCode}${airline.FlightNumber}<br>
                                Class: ${airline.FareClass}<br>
                                Aircraft: ${segment.Craft}
                            </div>
                        </div>
                    </td>
                    <td>
                        <strong>${segment.Origin.Airport.AirportCode}</strong><br>
                        ${segment.Origin.Airport.AirportName}<br>
                        Terminal: ${segment.Origin.Airport.Terminal}<br>
                        ${formatTime(segment.Origin.DepTime)}<br>
                        ${formatDate(segment.Origin.DepTime)}
                    </td>
                    <td>
                        <strong>${segment.Destination.Airport.AirportCode}</strong><br>
                        ${segment.Destination.Airport.AirportName}<br>
                        Terminal: ${segment.Destination.Airport.Terminal}<br>
                        ${formatTime(segment.Destination.ArrTime)}<br>
                        ${formatDate(segment.Destination.ArrTime)}
                    </td>
                    <td>
                        ${Math.floor(segment.Duration / 60)}h ${segment.Duration % 60}m
                    </td>
                    <td>${segment.FlightStatus}</td>
                </tr>
            </tbody>
        </table>

        <!-- Fare Breakdown -->
        <div class="section-title">FARE DETAILS</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th style="text-align: right;">Amount (INR)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Base Fare</td>
                    <td style="text-align: right;">${numberFormat(fare.BaseFare, 2)}</td>
                </tr>
                ${fare.TaxBreakup.map(tax => `
                <tr>
                    <td>${tax.key}</td>
                    <td style="text-align: right;">${numberFormat(tax.value, 2)}</td>
                </tr>
                `).join('')}
                <tr class="total-row">
                    <td><strong>Total Amount</strong></td>
                    <td style="text-align: right;"><strong>${numberFormat(fare.PublishedFare, 2)}</strong></td>
                </tr>
            </tbody>
        </table>

        <!-- Important Notes -->
        <div class="section-title">IMPORTANT INFORMATION</div>
        <ul class="notes">
            <li>This is an electronic ticket. Passengers must carry a valid photo ID.</li>
            <li>Check-in begins 48 hours and closes 60 minutes before departure.</li>
            <li>Baggage allowance: ${segment.Baggage} check-in + ${segment.CabinBaggage} cabin</li>
            <li>Web check-in is mandatory for all passengers.</li>
            <li>For any queries, contact airline at ${flightData.AirlineTollFreeNo}</li>
        </ul>

        <!-- Footer -->
        <div class="footer">
            <p>Thank you for choosing ${airline.AirlineName}. Have a pleasant journey!</p>
        </div>
    </div>
</body>
</html>`;

    const text = `Flight Ticket:
PNR: ${flightData.PNR}
Booking ID: ${data.Response.Response.BookingId}
Issue Date: ${formatDate(primaryPassenger.Ticket.IssueDate)}

Passengers:
${passengers.map(pax => 
    `${pax.Title}. ${pax.FirstName} ${pax.LastName} (${pax.PaxType === 1 ? 'Adult' : pax.PaxType === 2 ? 'Child' : 'Infant'}) - Ticket: ${pax.Ticket.TicketNumber || 'Not Issued'}`
).join('\n')}

Flight:
${airline.AirlineName} ${airline.AirlineCode}${airline.FlightNumber} (${airline.FareClass})
Departure: ${segment.Origin.Airport.AirportCode} at ${formatTime(segment.Origin.DepTime)} on ${formatDate(segment.Origin.DepTime)}
Arrival: ${segment.Destination.Airport.AirportCode} at ${formatTime(segment.Destination.ArrTime)} on ${formatDate(segment.Destination.ArrTime)}
Duration: ${Math.floor(segment.Duration / 60)}h ${segment.Duration % 60}m
Status: ${segment.FlightStatus}
Baggage: ${segment.Baggage} check-in + ${segment.CabinBaggage} cabin

Fare Details:
Base Fare: Rs ${numberFormat(fare.BaseFare, 2)}
${fare.TaxBreakup.map(tax => `${tax.key}: Rs ${numberFormat(tax.value, 2)}`).join('\n')}
Total Amount: Rs ${numberFormat(fare.PublishedFare, 2)}

Important Information:
- This is an electronic ticket. Valid photo ID required.
- Check-in begins 48 hours before departure.
- Web check-in is mandatory.
- Contact airline at ${flightData.AirlineTollFreeNo} for queries.

Thank you for choosing ${airline.AirlineName}!`;

    return { html, text };
};