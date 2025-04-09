import { LOGO } from '../constants/commonConstants';

export const bookConfirmationTemplate = (bookingData: any, user_name: string) => {
    const response = bookingData.Response.Response;
    const flight = response.FlightItinerary;
    const outboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 1);
    const inboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 2);
    const passengers = flight.Passenger;
    
    // Format date and time for outbound flight
    const outDepDate = new Date(outboundSegment.Origin.DepTime).toLocaleDateString('en-IN');
    const outDepTime = new Date(outboundSegment.Origin.DepTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const outArrDate = new Date(outboundSegment.Destination.ArrTime).toLocaleDateString('en-IN');
    const outArrTime = new Date(outboundSegment.Destination.ArrTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Format date and time for inbound flight if exists
    let inboundHtml = '';
    if (inboundSegment) {
        const inDepDate = new Date(inboundSegment.Origin.DepTime).toLocaleDateString('en-IN');
        const inDepTime = new Date(inboundSegment.Origin.DepTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const inArrDate = new Date(inboundSegment.Destination.ArrTime).toLocaleDateString('en-IN');
        const inArrTime = new Date(inboundSegment.Destination.ArrTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

        inboundHtml = `
            <div class="section">
                <h3 class="flight-type">Inbound Flight (Return)</h3>
                <div class="flight-info">
                    <div>
                        <h4>${inboundSegment.Origin.Airport.AirportName} (${inboundSegment.Origin.Airport.AirportCode})</h4>
                        <p>${inDepDate}</p>
                        <p><strong>${inDepTime}</strong></p>
                        <p>Terminal: ${inboundSegment.Origin.Airport.Terminal || 'N/A'}</p>
                    </div>
                    
                    <div class="flight-arrow">
                        <p>→</p>
                        <p>Duration: ${Math.floor(inboundSegment.Duration / 60)}h ${inboundSegment.Duration % 60}m</p>
                    </div>
                    
                    <div>
                        <h4>${inboundSegment.Destination.Airport.AirportName} (${inboundSegment.Destination.Airport.AirportCode})</h4>
                        <p>${inArrDate}</p>
                        <p><strong>${inArrTime}</strong></p>
                        <p>Terminal: ${inboundSegment.Destination.Airport.Terminal || 'N/A'}</p>
                    </div>
                </div>
                <p>Airline: ${inboundSegment.Airline.AirlineName} (${inboundSegment.Airline.AirlineCode} ${inboundSegment.Airline.FlightNumber})</p>
                <p>Booking Status: ${inboundSegment.Status === 'HK' ? 'Confirmed' : inboundSegment.Status}</p>
            </div>
        `;
    }

    // Calculate total fare
    const totalFare = flight.Fare.PublishedFare.toFixed(2);
    
    const html = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
    <title>Booking Confirmation</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            color: #333;
        }
        a {
            color: #2051A0;
            text-decoration: none;
        }
        table {
            border-collapse: collapse;
            width: 100%;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #ddd;
        }
        .header {
            padding: 20px;
            text-align: center;
            background: #f8f8f8;
            border-bottom: 1px solid #ddd;
        }
        .content {
            padding: 20px;
        }
        .section {
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .section:last-child {
            border-bottom: none;
        }
        .flight-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f5f9ff;
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .flight-info > div {
            flex: 1;
            padding: 0 10px;
        }
        .flight-arrow {
            text-align: center;
            flex: 0 0 60px;
        }
        .passenger-table {
            width: 100%;
            border: 1px solid #ddd;
            margin-top: 15px;
        }
        .passenger-table th, .passenger-table td {
            padding: 12px;
            border: 1px solid #ddd;
            text-align: left;
        }
        .passenger-table th {
            background-color: #2051A0;
            color: white;
        }
        .footer {
            padding: 20px;
            background: #2051A0;
            color: white;
            text-align: center;
            font-size: 14px;
        }
        .total-fare {
            font-size: 18px;
            font-weight: bold;
            color: #2051A0;
            margin-top: 20px;
            padding: 10px;
            background: #f5f9ff;
            border-radius: 5px;
            text-align: center;
        }
        .flight-type {
            color: #2051A0;
            font-weight: bold;
            margin-bottom: 15px;
            padding-bottom: 5px;
            border-bottom: 2px solid #2051A0;
            display: inline-block;
        }
        @media (max-width: 600px) {
            .flight-info {
                flex-direction: column;
                text-align: center;
            }
            .flight-info > div {
                margin-bottom: 10px;
            }
            .flight-arrow {
                margin: 10px 0;
                transform: rotate(90deg);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="${LOGO}" alt="Company Logo" width="200">
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Dear ${user_name},</h2>
                <p>Your booking has been confirmed. Thank you for choosing us as your travel partner!</p>
                <p>Below are the details of your flight booking:</p>
            </div>
            
            <div class="section">
                <h3>Booking Reference: ${flight.PNR}</h3>
                <p>Booking ID: ${flight.BookingId}</p>
                <p>Booking Date: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            
            <div class="section">
                <h3 class="flight-type">Inbound Flight (Arrival)</h3>
                <div class="flight-info">
                    <div>
                        <h4>${outboundSegment.Origin.Airport.AirportName} (${outboundSegment.Origin.Airport.AirportCode})</h4>
                        <p>${outDepDate}</p>
                        <p><strong>${outDepTime}</strong></p>
                        <p>Terminal: ${outboundSegment.Origin.Airport.Terminal || 'N/A'}</p>
                    </div>
                    
                    <div class="flight-arrow">
                        <p>→</p>
                        <p>Duration: ${Math.floor(outboundSegment.Duration / 60)}h ${outboundSegment.Duration % 60}m</p>
                    </div>
                    
                    <div>
                        <h4>${outboundSegment.Destination.Airport.AirportName} (${outboundSegment.Destination.Airport.AirportCode})</h4>
                        <p>${outArrDate}</p>
                        <p><strong>${outArrTime}</strong></p>
                        <p>Terminal: ${outboundSegment.Destination.Airport.Terminal || 'N/A'}</p>
                    </div>
                </div>
                <p>Airline: ${outboundSegment.Airline.AirlineName} (${outboundSegment.Airline.AirlineCode} ${outboundSegment.Airline.FlightNumber})</p>
                <p>Booking Status: ${outboundSegment.Status === 'HK' ? 'Confirmed' : outboundSegment.Status}</p>
                <p>Baggage Allowance: ${outboundSegment.Baggage || '15 KG'} (Check-in), ${outboundSegment.CabinBaggage || '7 KG'} (Cabin)</p>
            </div>
            
            ${inboundHtml}
            
            <div class="section">
                <h3>Passenger Details</h3>
                <table class="passenger-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Ticket No.</th>
                            <th>Baggage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${passengers.map(passenger => `
                        <tr>
                            <td>${passenger.Title} ${passenger.FirstName} ${passenger.LastName}</td>
                            <td>${passenger.PaxType === 1 ? 'Adult' : passenger.PaxType === 2 ? 'Child' : 'Infant'}</td>
                            <td>${passenger.Ticket.TicketNumber}</td>
                            <td>${passenger.SegmentAdditionalInfo[0]?.Baggage || '15 KG'}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h3>Fare Summary</h3>
                <table class="passenger-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Amount (INR)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Base Fare</td>
                            <td>${flight.Fare.BaseFare.toFixed(2)}</td>
                        </tr>
                        ${flight.Fare.TaxBreakup.map((tax: any) => `
                        <tr>
                            <td>${tax.key === 'TotalTax' ? 'Total Taxes' : tax.key}</td>
                            <td>${tax.value.toFixed(2)}</td>
                        </tr>
                        `).join('')}
                        <tr>
                            <td><strong>Total Amount</strong></td>
                            <td><strong>${totalFare}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h3>Important Information</h3>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Please check-in online or arrive at the airport at least 3 hours before departure for international flights, 2 hours for domestic flights.</li>
                    <li style="margin-bottom: 8px;">Carry a printed copy of this confirmation or show it on your mobile device at check-in.</li>
                    <li style="margin-bottom: 8px;">Ensure all passengers have valid government-issued photo ID proof.</li>
                    <li style="margin-bottom: 8px;">Baggage allowance is per passenger. Excess baggage charges may apply.</li>
                    ${inboundSegment ? '<li style="margin-bottom: 8px;">Please check the return flight details and reporting time carefully.</li>' : ''}
                    <li style="margin-bottom: 8px;">For any changes or cancellations, please contact our customer support.</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <h3 style="margin-top: 0;">Need Assistance?</h3>
            <p style="margin: 8px 0;">Email: <a href="mailto:support@yourcompany.com" style="color: #fff; text-decoration: underline;">support@yourcompany.com</a></p>
            <p style="margin: 8px 0;">Phone: <a href="tel:+911234567890" style="color: #fff; text-decoration: underline;">+91 1234567890</a></p>
            <p style="margin: 8px 0;">Office Hours: 9:00 AM to 6:00 PM (Monday to Saturday)</p>
            <p style="margin: 20px 0 0 0; font-size: 12px;">© ${new Date().getFullYear()} Page1 Travel. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    return html;
}