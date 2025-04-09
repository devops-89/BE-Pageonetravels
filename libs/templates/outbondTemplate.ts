import { LOGO } from '../constants/commonConstants';

export const bookingConTemplate = (bookingData: any, user_name: string) => {
    const response = bookingData.Response.Response;
    const flight = response.FlightItinerary;
    const outboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 1);
    const inboundSegment = flight.Segments.find((s: any) => s.TripIndicator === 2);
    const passengers = flight.Passenger;
    
    // Format date and time for outbound flight
    const outDepDate = new Date(outboundSegment.Origin.DepTime).toLocaleDateString();
    const outDepTime = new Date(outboundSegment.Origin.DepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const outArrDate = new Date(outboundSegment.Destination.ArrTime).toLocaleDateString();
    const outArrTime = new Date(outboundSegment.Destination.ArrTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Format date and time for inbound flight if exists 
    let inboundHtml = ''; 
    if (inboundSegment) {
        const inDepDate = new Date(inboundSegment.Origin.DepTime).toLocaleDateString();
        const inDepTime = new Date(inboundSegment.Origin.DepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const inArrDate = new Date(inboundSegment.Destination.ArrTime).toLocaleDateString();
        const inArrTime = new Date(inboundSegment.Destination.ArrTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        inboundHtml = `
            <div class="section">
                <h3>Return Flight Details</h3>
                <div class="flight-info">
                    <div>
                        <h4>${inboundSegment.Origin.Airport.AirportName} (${inboundSegment.Origin.Airport.AirportCode})</h4>
                        <p>${inDepDate}</p>
                        <p><strong>${inDepTime}</strong></p>
                        <p>Terminal: ${inboundSegment.Origin.Airport.Terminal}</p>
                    </div>
                    
                    <div>
                        <p>→</p>
                        <p>Duration: ${Math.floor(inboundSegment.Duration / 60)}h ${inboundSegment.Duration % 60}m</p>
                    </div>
                    
                    <div>
                        <h4>${inboundSegment.Destination.Airport.AirportName} (${inboundSegment.Destination.Airport.AirportCode})</h4>
                        <p>${inArrDate}</p>
                        <p><strong>${inArrTime}</strong></p>
                        <p>Terminal: ${inboundSegment.Destination.Airport.Terminal}</p>
                    </div>
                </div>
                <p>Airline: ${inboundSegment.Airline.AirlineName} (${inboundSegment.Airline.AirlineCode} ${inboundSegment.Airline.FlightNumber})</p>
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
        }
        .header {
            padding: 20px;
            text-align: center;
            background: #f8f8f8;
        }
        .content {
            padding: 20px;
        }
        .section {
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .flight-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: #f0f7ff;
            border-radius: 5px;
            margin-bottom: 15px;
        }
        .flight-details {
            text-align: center;
            margin: 15px 0;
        }
        .passenger-table {
            width: 100%;
            border: 1px solid #ddd;
            margin-top: 15px;
        }
        .passenger-table th, .passenger-table td {
            padding: 10px;
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
        }
        .total-fare {
            font-size: 18px;
            font-weight: bold;
            color: #2051A0;
            margin-top: 20px;
        }
        .flight-type {
            color: #2051A0;
            font-weight: bold;
            margin-bottom: 10px;
        }
        @media (max-width: 600px) {
            .flight-info {
                flex-direction: column;
                text-align: center;
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
            </div>
            
            <div class="section">
                <h3 class="flight-type">Outbound Flight (Departure)</h3>
                <div class="flight-info">
                    <div>
                        <h4>${outboundSegment.Origin.Airport.AirportName} (${outboundSegment.Origin.Airport.AirportCode})</h4>
                        <p>${outDepDate}</p>
                        <p><strong>${outDepTime}</strong></p>
                        <p>Terminal: ${outboundSegment.Origin.Airport.Terminal}</p>
                    </div>
                    
                    <div>
                        <p>→</p>
                        <p>Duration: ${Math.floor(outboundSegment.Duration / 60)}h ${outboundSegment.Duration % 60}m</p>
                    </div>
                    
                    <div>
                        <h4>${outboundSegment.Destination.Airport.AirportName} (${outboundSegment.Destination.Airport.AirportCode})</h4>
                        <p>${outArrDate}</p>
                        <p><strong>${outArrTime}</strong></p>
                        <p>Terminal: ${outboundSegment.Destination.Airport.Terminal}</p>
                    </div>
                </div>
                <p>Airline: ${outboundSegment.Airline.AirlineName} (${outboundSegment.Airline.AirlineCode} ${outboundSegment.Airline.FlightNumber})</p>
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
                            <td>${passenger.SegmentAdditionalInfo[0].Baggage}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="section">
                <h3>Fare Summary</h3>
                <p>Base Fare: INR ${flight.Fare.BaseFare.toFixed(2)}</p>
                <p>Taxes & Fees: INR ${flight.Fare.Tax.toFixed(2)}</p>
                <div class="total-fare">
                    Total: INR ${totalFare}
                </div>
            </div>
            
            <div class="section">
                <h3>Important Information</h3>
                <ul>
                    <li>Please check-in online or arrive at the airport at least 2 hours before departure.</li>
                    <li>Carry a printed copy of this confirmation or show it on your mobile device at check-in.</li>
                    <li>Ensure all passengers have valid ID proof as per airline requirements.</li>
                    ${inboundSegment ? '<li>Remember to check the return flight details above.</li>' : ''}
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <h3>Need Assistance?</h3>
            <p>Contact our customer support:</p>
            <p>Email: support@yourcompany.com</p>
            <p>Phone: +1 (123) 456-7890</p>
            <p>© ${new Date().getFullYear()} Page1 Travel. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    return html;
}