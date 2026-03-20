import { LOGO } from '../constants/commonConstants';

export const bookingConfirmationTemplate = (bookingData: any, user_name: string, commission: any) => {
    const response = bookingData.Response.Response;
    const flight = response.FlightItinerary;
    const segments = flight.Segments[0];
    const passengers = flight.Passenger;
    const totalSSRCharges: number = flight.Fare.TotalBaggageCharges + flight.Fare.TotalMealCharges + flight.Fare.TotalSeatCharges;

    // .Response.Response.FlightItinerary.Fare.BaseFare
    const depDate = new Date(segments.Origin.DepTime).toLocaleDateString();
    const depTime = new Date(segments.Origin.DepTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const arrDate = new Date(segments.Destination.ArrTime).toLocaleDateString();
    const arrTime = new Date(segments.Destination.ArrTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const totalTax: number = Number(flight.Fare.Tax);
    const convenienceCharge = Number(flight.Fare.OtherCharges) + Number(flight.Fare.ServiceFee) + Number(flight.Fare.AdditionalTxnFeePub);
    const totalFare: number = Number(flight.Fare.PublishedFare);

    // function to format the Baggage Value
    function getFormatedTotalBaggage(baggage: string): string {
        if (baggage.includes('|')) {
            let baggageValues: string[] = baggage.split('|');

            let firstValue: number = parseInt(baggageValues[0]);
            let secondValue: number = parseInt(baggageValues[1]);
            let baggageSum: number = firstValue + secondValue;
            return `${baggageSum} KG`;
        } else {
            return baggage;
        }
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Flight Booking Confirmation</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000;">
  <div style="width: 800px; margin: 40px auto; border: 1px solid #000; padding: 30px; box-sizing: border-box;">

    <!-- HEADER -->
    <div style="text-align: left; font-weight: bold; text-transform: uppercase; font-size: 22px; margin-top: 20px;">
      <img src="${LOGO}" alt="Company Logo" width="200" />
      <hr/>
    </div>

    <!-- BASIC INFO -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
      <div><strong>Booking ID:</strong> ${flight.BookingId}</div>
      <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>

    <hr />

    <div style="width: 100%; background-color: #3b5570; color: #fff; text-align: center; padding: 6px 0;
      font-weight: bold; font-size: 16px; text-transform: uppercase; margin: 10px 0 25px 0;">
      Flight Invoice
    </div>

    <!-- USER GREETING -->
    <div style="font-size: 15px; margin-bottom: 20px;">
      <p><strong>Dear ${user_name},</strong></p>
      <p>Your flight booking has been successfully confirmed. Please find your flight itinerary below.</p>
    </div>

    <!-- FLIGHT DETAILS -->
    <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
      Flight Details
    </div>

    <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
      <thead>
        <tr>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570;
            color: #fff; text-align: left;">Airline</th>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570;
            color: #fff; text-align: left;">PNR</th>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570;
            color: #fff; text-align: left;">Flight No.</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="border: 1px solid #000; padding: 8px 10px;">
            ${segments.Airline.AirlineName}
          </td>
          <td style="border: 1px solid #000; padding: 8px 10px;">
            ${flight.PNR}
          </td>
          <td style="border: 1px solid #000; padding: 8px 10px;">
            ${segments.Airline.AirlineCode} ${segments.Airline.FlightNumber}
          </td>
        </tr>
      </tbody>
    </table>

    <!-- ROUTE INFO -->
    <table style="width:100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
      <thead>
        <tr>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570; color:#fff;">Departure</th>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570; color:#fff;">Arrival</th>
          <th style="border: 1px solid #000; padding: 8px 10px; background-color: #3b5570; color:#fff;">Duration</th>
        </tr>
      </thead>

      <tbody>
        <tr>
          <td style="border:1px solid #000; padding:8px 10px;">
            <strong>${segments.Origin.Airport.AirportName}</strong> (${segments.Origin.Airport.AirportCode})<br/>
            ${depDate} — <strong>${depTime}</strong><br/>
            Terminal: ${segments.Origin.Airport.Terminal}
          </td>

          <td style="border:1px solid #000; padding:8px 10px;">
            <strong>${segments.Destination.Airport.AirportName}</strong> (${segments.Destination.Airport.AirportCode})<br/>
            ${arrDate} — <strong>${arrTime}</strong><br/>
            Terminal: ${segments.Destination.Airport.Terminal}
          </td>

          <td style="border:1px solid #000; padding:8px 10px;">
            ${Math.floor(segments.Duration / 60)}h ${segments.Duration % 60}m
          </td>
        </tr>
      </tbody>
    </table>

    <!-- PASSENGER TABLE -->
    <div style="margin-top: 30px;">
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
        Passenger Details
      </div>

      <table style="width:100%; border-collapse: collapse; margin-top:15px; font-size:15px;">
        <thead>
          <tr>
            <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Name</th>
            <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Type</th>
            <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Ticket No.</th>
            <th style="border:1px solid #000; padding:8px 10px; background-color:#3b5570; color:#fff;">Baggage</th>
          </tr>
        </thead>

        <tbody>
          ${passengers
              .map(
                  (p) => `
            <tr>
              <td style="border:1px solid #000; padding:8px 10px;">${p.Title} ${p.FirstName} ${p.LastName}</td>
              <td style="border:1px solid #000; padding:8px 10px;">
                ${p.PaxType === 1 ? 'Adult' : p.PaxType === 2 ? 'Child' : 'Infant'}
              </td>
              <td style="border:1px solid #000; padding:8px 10px;">${p.Ticket.TicketNumber}</td>
              <td style="border:1px solid #000; padding:8px 10px;">${getFormatedTotalBaggage(p.SegmentAdditionalInfo[0].Baggage)}</td>
            </tr>
          `
              )
              .join('')}
        </tbody>
      </table>
    </div>


    <!-- FARE SUMMARY -->
    <div style="margin-top: 30px;">
      <div style="font-weight:bold; font-size:16px; margin-bottom:8px; text-transform:uppercase; text-decoration:underline;">
        Fare Summary
      </div>

      <table style="width:100%; border-collapse:collapse; margin-top:20px; font-size:15px;">
        <tbody>
          <tr>
            <td style="border:1px solid #000; padding:8px 10px;"><strong>Base Fare:</strong></td>
            <td style="border:1px solid #000; padding:8px 10px;">₹${(Number(flight.Fare.BaseFare) + Number(commission)).toFixed(2)}</td>
          </tr>

          <tr>
            <td style="border:1px solid #000; padding:8px 10px;"><strong>Taxes & Fees:</strong></td>
            <td style="border:1px solid #000; padding:8px 10px;">₹${totalTax.toFixed(2)}</td>
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
            <td style="border:1px solid #000; padding:8px 10px;"><strong>Total Amount:</strong></td>
          <td style="border:1px solid #000; padding:8px 10px;">₹${(Number(totalFare) + Number(commission)).toFixed(2)}</td>
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

    </ul>

    <hr style="margin-top:30px;">

    <div style="text-align:center; font-size:14px; margin-top:15px;">
        <strong>Need Help?</strong><br>
        Email: info@page1travels.com<br>
        Phone: +91 7977512494<br><br>
        © ${new Date().getFullYear()} Page1Travels. All Rights Reserved.
    </div>

    </div>

  </div>
</body>
</html>`;

    return html;
};
