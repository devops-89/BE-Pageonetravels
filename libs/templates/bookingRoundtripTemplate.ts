import { LOGO } from "../constants/commonConstants";

export const bookingRoundTripTemplate = (
    outboundData: any,
    inboundData: any,
    user_name: string,
    inboundComission:number,
    outboundComission:number
) => {
    // ---------------- OUTBOUND ----------------
    const outResponse = outboundData.Response.Response;
    const outFlight = outResponse.FlightItinerary;

    const outPassengers = outFlight.Passenger;

    const outSegment = outFlight.Segments.find((s: any) => s.TripIndicator === 1);

    const outDepDate = new Date(outSegment.Origin.DepTime).toLocaleDateString();
    const outDepTime = new Date(outSegment.Origin.DepTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const outArrDate = new Date(outSegment.Destination.ArrTime).toLocaleDateString();
    const outArrTime = new Date(outSegment.Destination.ArrTime).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
    );

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

    const outBaseFare = Number(outFlight.Fare.BaseFare);
    const outTax = Number(outFlight.Fare.Tax);
    const outConv =
        Number(outFlight.Fare.OtherCharges) +
        Number(outFlight.Fare.ServiceFee) +
        Number(outFlight.Fare.AdditionalTxnFeePub);

    const outSSR =
        Number(outFlight.Fare.TotalMealCharges) +
        Number(outFlight.Fare.TotalSeatCharges) +
        Number(outFlight.Fare.TotalBaggageCharges);

    const outPublishedFare = Number(outFlight.Fare.PublishedFare);

    // ---------------- INBOUND ----------------
    const inResponse = inboundData.Response.Response;
    const inFlight = inResponse.FlightItinerary;

    const inSegment = inFlight.Segments.find((s: any) => s.TripIndicator === 1 || s.TripIndicator === 2);

    const inDepDate = new Date(inSegment.Origin.DepTime).toLocaleDateString();
    const inDepTime = new Date(inSegment.Origin.DepTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const inArrDate = new Date(inSegment.Destination.ArrTime).toLocaleDateString();
    const inArrTime = new Date(inSegment.Destination.ArrTime).toLocaleTimeString(
        [],
        { hour: "2-digit", minute: "2-digit" }
    );

    const inBaseFare = Number(inFlight.Fare.BaseFare);
    const inTax = Number(inFlight.Fare.Tax);
    const inConv =
        Number(inFlight.Fare.OtherCharges) +
        Number(inFlight.Fare.ServiceFee) +
        Number(inFlight.Fare.AdditionalTxnFeePub);

    const inSSR =
        Number(inFlight.Fare.TotalMealCharges) +
        Number(inFlight.Fare.TotalSeatCharges) +
        Number(inFlight.Fare.TotalBaggageCharges);

    const inPublishedFare = Number(inFlight.Fare.PublishedFare);

    // ---------------- COMBINED FARE ----------------
    const totalBaseFare = outBaseFare + inBaseFare;
    const totalTax = outTax + inTax;
    const totalConv = outConv + inConv;
    const totalSSR = outSSR + inSSR;
    const totalFare = outPublishedFare + inPublishedFare;
    const totalCommission:number=inboundComission+outboundComission;

    // ---------------- INBOUND HTML ----------------
    const inboundHtml = `
        <div style="font-weight:bold; font-size:16px; margin-top:30px; text-transform:uppercase; text-decoration:underline;">
            Return Flight Details
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
                        <strong>${inSegment.Origin.Airport.AirportName}</strong>
                        (${inSegment.Origin.Airport.AirportCode})<br/>
                        ${inDepDate} — <strong>${inDepTime}</strong><br/>
                        Terminal: ${inSegment.Origin.Airport.Terminal || "N/A"}
                    </td>

                    <td style="border:1px solid #000; padding:8px 10px;">
                        <strong>${inSegment.Destination.Airport.AirportName}</strong>
                        (${inSegment.Destination.Airport.AirportCode})<br/>
                        ${inArrDate} — <strong>${inArrTime}</strong><br/>
                        Terminal: ${inSegment.Destination.Airport.Terminal || "N/A"}
                    </td>

                    <td style="border:1px solid #000; padding:8px 10px;">
                        ${Math.floor(inSegment.Duration / 60)}h ${inSegment.Duration % 60}m
                    </td>
                </tr>
            </tbody>
        </table>

        <p style="font-size:15px; margin-top:10px;"><strong>Airline:</strong>
            ${inSegment.Airline.AirlineName}
            (${inSegment.Airline.AirlineCode} ${inSegment.Airline.FlightNumber})
        </p>
    `;

    // ---------------- FINAL TEMPLATE ----------------
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <title>Roundtrip Booking Confirmation</title>
</head>

<body style="font-family:Arial, sans-serif; background:#fff; padding:0; margin:0; color:#000;">
<div style="width:800px; margin:40px auto; border:1px solid #000; padding:30px;">

    <!-- HEADER -->
    <img src="${LOGO}" width="200" />
    <hr/>

    <div style="display:flex; justify-content:space-between; font-size:15px;">
        <div><strong>Booking ID:</strong> ${outFlight.BookingId}</div>
        <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>

    <hr />

    <div style="background:#3b5570; color:#fff; padding:6px 0; text-align:center; margin:20px 0; font-weight:bold; text-transform:uppercase;">
        Roundtrip Booking Confirmation
    </div>

    <p><strong>Dear ${user_name},</strong></p>
    <p>Your roundtrip flight booking has been confirmed. Below are your itinerary details.</p>

    <!-- OUTBOUND -->
    <div style="font-weight:bold; font-size:16px; text-decoration:underline; margin-top:20px;">Outbound Flight Details</div>

    <table style="width:100%; border-collapse:collapse; margin-top:10px;">
        <thead>
            <tr>
                <th style="background:#3b5570;color:#fff;padding:8px;border:1px solid #000;">Departure</th>
                <th style="background:#3b5570;color:#fff;padding:8px;border:1px solid #000;">Arrival</th>
                <th style="background:#3b5570;color:#fff;padding:8px;border:1px solid #000;">Duration</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td style="border:1px solid #000;padding:8px;">
                    <strong>${outSegment.Origin.Airport.AirportName}</strong>
                    (${outSegment.Origin.Airport.AirportCode})<br/>
                    ${outDepDate} — <strong>${outDepTime}</strong><br/>
                    Terminal: ${outSegment.Origin.Airport.Terminal}
                </td>

                <td style="border:1px solid #000;padding:8px;">
                    <strong>${outSegment.Destination.Airport.AirportName}</strong>
                    (${outSegment.Destination.Airport.AirportCode})<br/>
                    ${outArrDate} — <strong>${outArrTime}</strong><br/>
                    Terminal: ${outSegment.Destination.Airport.Terminal}
                </td>

                <td style="border:1px solid #000;padding:8px;">
                    ${Math.floor(outSegment.Duration / 60)}h ${outSegment.Duration % 60}m
                </td>
            </tr>
        </tbody>
    </table>

    <p><strong>Airline:</strong> ${outSegment.Airline.AirlineName}
        (${outSegment.Airline.AirlineCode} ${outSegment.Airline.FlightNumber})
    </p>

    <!-- INBOUND -->
    ${inboundHtml}

    <!-- PASSENGERS -->
    <div style="font-weight:bold;font-size:16px;text-decoration:underline;margin-top:30px;">Passenger Details</div>

    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <thead>
            <tr>
                <th style="background:#3b5570;color:#fff;border:1px solid #000;padding:8px;">Name</th>
                <th style="background:#3b5570;color:#fff;border:1px solid #000;padding:8px;">Type</th>
                <th style="background:#3b5570;color:#fff;border:1px solid #000;padding:8px;">Ticket No.</th>
                <th style="background:#3b5570;color:#fff;border:1px solid #000;padding:8px;">Baggage</th>
            </tr>
        </thead>

        <tbody>
            ${outPassengers
        .map(
            (p: any) => `
                <tr>
                    <td style="border:1px solid #000;padding:8px;">${p.Title} ${p.FirstName} ${p.LastName}</td>
                    <td style="border:1px solid #000;padding:8px;">
                        ${p.PaxType === 1 ? "Adult" : p.PaxType === 2 ? "Child" : "Infant"}
                    </td>
                    <td style="border:1px solid #000;padding:8px;">${p.Ticket.TicketNumber}</td>
                    <td style="border:1px solid #000;padding:8px;">${getFormatedTotalBaggage(p.SegmentAdditionalInfo[0].Baggage)}</td>
                </tr>`
        )
        .join("")}
        </tbody>
    </table>

    <!-- FARE SUMMARY -->
    <div style="font-weight:bold;font-size:16px;text-decoration:underline;margin-top:30px;">Fare Summary</div>

    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
        <tbody>
            <tr>
                <td style="border:1px solid #000;padding:8px;"><strong>Base Fare:</strong></td>
                <td style="border:1px solid #000;padding:8px;">₹${(Number(totalBaseFare)+Number(totalCommission)).toFixed(2)}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;padding:8px;"><strong>Taxes & Fees:</strong></td>
                <td style="border:1px solid #000;padding:8px;">₹${totalTax.toFixed(2)}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;padding:8px;"><strong>Convenience Fee:</strong></td>
                <td style="border:1px solid #000;padding:8px;">₹${totalConv.toFixed(2)}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;padding:8px;"><strong>Add-ons (Meal + Seat + Baggage):</strong></td>
                <td style="border:1px solid #000;padding:8px;">₹${totalSSR.toFixed(2)}</td>
            </tr>

            <tr>
                <td style="border:1px solid #000;padding:8px;font-weight:bold;">Total Fare:</td>
                <td style="border:1px solid #000;padding:8px;font-weight:bold;">₹${(Number(totalFare)+Number(totalCommission)).toFixed(2)}</td>
            </tr>
        </tbody>
    </table>

    <!-- INFO -->
    <div style="font-weight:bold;font-size:16px;text-decoration:underline;margin-top:30px;">Important Information</div>

    <ul style="font-size:15px;">
        <li>Please arrive at the airport at least 2 hours before departure.</li>
        <li>Carry a valid government ID proof.</li>
        <li>Online check-in is recommended.</li>
        <li>Please verify your return flight timing carefully.</li>
    </ul>

    <hr style="margin-top:30px;" />

    <div style="text-align:center;font-size:14px;">
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
