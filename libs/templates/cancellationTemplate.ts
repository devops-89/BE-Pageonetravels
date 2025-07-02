export const cancellationConfirmationTemplate = (cancellationData: any, user_name: string) => {
    const response = cancellationData.data;
    const charges = cancellationData.cancellationCharges;

    const html = `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
    <title>Ticket Cancellation Confirmation</title>
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
        .amount {
            font-size: 18px;
            font-weight: bold;
            color: #2051A0;
            margin-top: 20px;
            padding: 10px;
            background: #f5f9ff;
            border-radius: 5px;
            text-align: center;
        }
        .footer {
            padding: 20px;
            background: #2051A0;
            color: white;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Ticket Cancellation Confirmation</h2>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Dear ${user_name},</h2>
                <p>Your flight ticket cancellation request has been processed successfully.</p>
            </div>
            
            <div class="section">
                <h3>Cancellation Details</h3>
                <p><strong>Booking ID:</strong> ${response.BookingId}</p>
                <p><strong>Cancellation Status:</strong> ${response.Status}</p>
                <p><strong>Remarks:</strong> ${response.Remarks || 'No remarks'}</p>
            </div>
            
            <div class="section">
                <h3>Refund Details</h3>
                <p><strong>Cancellation Charges:</strong> ${charges.Currency} ${charges.CancellationCharge.toFixed(2)}</p>
                <p><strong>Refund Amount:</strong> ${charges.Currency} ${charges.RefundAmount.toFixed(2)}</p>
                <div class="amount">
                    Total Refund: ${charges.Currency} ${charges.RefundAmount.toFixed(2)}
                </div>
            </div>
            
            <div class="section">
                <h3>Important Information</h3>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 8px;">The refund will be processed to your original payment method.</li>
                    <li style="margin-bottom: 8px;">It may take 7-10 business days for the refund to reflect in your account.</li>
                    <li style="margin-bottom: 8px;">For any queries regarding your refund, please contact our customer support.</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <h3>Need Assistance?</h3>
            <p>Contact our customer support:</p>
            <p>Email: support@page!travels.com</p>
            <p>Phone: +1 (123) 456-7890</p>
            <p>© ${new Date().getFullYear()} Page1Travels. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;

    return html;
}; 