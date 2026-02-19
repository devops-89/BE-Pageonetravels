import { LOGO } from '../constants/commonConstants';

export const hotelBookingTemplate = (bookingData: any, user_name: string, extraInfo) => {
    const response = bookingData;
    const hotel = response.HotelItinerary;

    const checkInDate = extraInfo?.checkIn || 'N/A';
    const checkOutDate = extraInfo.checkOut || 'N/A';

    const price = parseFloat(extraInfo.basePrice?.toFixed(2) || '0');
    const tax = parseFloat(extraInfo.tax?.toFixed(2) || '0');
    const serviceFees = parseFloat(extraInfo?.serviceFees?.toFixed(2) || '0');
    const Net_amount = (price + tax + serviceFees).toFixed(2);

    // calculate showing base fare, tax, total amount
    const showingBaseAmount:Number=Number(extraInfo?.totalAmount)-Number(extraInfo?.tax);
    const showingTax:Number=Number(extraInfo?.tax);
    const showingTotalAmount:Number=Number(extraInfo?.totalAmount);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Booking Confirmation</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #fff; color: #000;">
  <div style="width: 800px; margin: 40px auto; border: 1px solid #000; padding: 30px; box-sizing: border-box;">
    <div style="text-align: left; font-weight: bold; text-transform: uppercase; font-size: 22px; margin-top: 20px;">
      <img src="${LOGO}" alt="Company Logo" width="200" />
      <hr />
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px;">
      <div><strong>Booking Id:</strong> ${response?.BookingId || 'N/A'}</div>
      <div><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</div>
    </div>
    <hr />
    <div style="width: 100%; background-color: #3b5570; color: #fff; text-align: center; padding: 6px 0; font-weight: bold; font-size: 16px; text-transform: uppercase; margin: 10px 0 25px 0;">
      Invoice
    </div>

    <div style="display: flex; justify-content: space-between; gap: 30px; margin-top: 30px;">
      <div style="width: 48%; font-size: 15px; line-height: 1.6;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
          Hotel Details
        </div>
        <p><strong>${extraInfo.hotelName}</strong></p>
        <p>${extraInfo.hotelAddress || 'Not Available'}</p>
      </div>
      <div style="width: 48%; font-size: 15px; line-height: 1.6;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
          Agency Address Details
        </div>
        <p><strong>PAGE ONE TRAVELS PRIVATE LIMITED</strong></p>
        <p><b>PIN:</b> 122001</p>
        <p><b>PHONE:</b> 7977512494</p>
        <p>page1travels@gmail.com</p>
      </div>
    </div>

    <div style="margin-top: 30px;">
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
        Booking Details
      </div>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
        <thead>
          <tr>
            <th style="width: 35%; border: 1px solid #000; padding: 8px 10px; text-align: left; background-color: #3b5570; color: #fff; font-weight: bold;">Hotel Name</th>
            <th style="width: 30%; border: 1px solid #000; padding: 8px 10px; text-align: left; background-color: #3b5570; color: #fff; font-weight: bold;">Room Type</th>
            <th style="width: 20%; border: 1px solid #000; padding: 8px 10px; text-align: left; background-color: #3b5570; color: #fff; font-weight: bold;">PAX Name</th>
            <th style="width: 15%; border: 1px solid #000; padding: 8px 10px; text-align: left; background-color: #3b5570; color: #fff; font-weight: bold;">Rooms</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 10px;">${extraInfo.hotelName}</td>
            <td style="border: 1px solid #000; padding: 8px 10px;">${extraInfo.roomType || 'N/A'}</td>
            <td style="border: 1px solid #000; padding: 8px 10px;">${extraInfo.firstName || ''} ${extraInfo.lastName || ''}</td>
            <td style="border: 1px solid #000; padding: 8px 10px;">${extraInfo.rooms || 1}</td>
          </tr>
        </tbody>
      </table>


    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 15px; border: 1px solid black; padding: 10px; margin-top: 15px;">
      <div><strong>Check In:</strong> ${checkInDate}</div>
      <div><strong>Check Out:</strong> ${checkOutDate}</div>
    </div>

    <div style="margin-top: 30px;">
      <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; text-transform: uppercase; text-decoration: underline;">
        Billing Summary
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 15px;">
        <tbody>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 10px;"><strong>Base Price:</strong></td>
            <td style="border: 1px solid #000; padding: 8px 10px;">₹${showingBaseAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 10px;"><strong>Add Tax:</strong></td>
            <td style="border: 1px solid #000; padding: 8px 10px;">₹${showingTax.toFixed(2)}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #000; padding: 8px 10px;"><strong>Total Amount:</strong></td>
            <td style="border: 1px solid #000; padding: 8px 10px;">₹${showingTotalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div style="margin-top: 30px; font-style: italic; font-size: 15px;">Note: (Amount in Rs)</div>
  </div>
</body>
</html>`;

    return html;
};
