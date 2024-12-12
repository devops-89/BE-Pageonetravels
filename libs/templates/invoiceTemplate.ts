import { LOGO } from '../constants/commonConstants';
export const invoiceEmailTemplate = function (invoiceData: any) {
    const {
        orderId,
        customerName,
        billingAddress,
        shippingAddress,
        invoiceDate,
        orderDate,
        productName,
        quantity,
        grossAmount,
        discount,
        taxableValue,
        igst,
        totalAmount,
        grandTotal
    } = invoiceData;
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice for Order ${orderId}</title>
        <style>
            body { font-family: Arial, sans-serif; background-color: #F7F7F7; margin: 0; padding: 20px; }
            .container { background-color: #FFFFFF; padding: 20px; border-radius: 5px; }
            h1 { color: #333; }
            .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            table, th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello ${customerName},</h1>
            <p>Thank you for your purchase. Here are the details of your order:</p>
            <table>
                <tr>
                    <th>Order ID</th>
                    <td>${orderId}</td>
                </tr>
                <tr>
                    <th>Invoice Date</th>
                    <td>${invoiceDate}</td>
                </tr>
                <tr>
                    <th>Order Date</th>
                    <td>${orderDate}</td>
                </tr>
                <tr>
                    <th>Product Name</th>
                    <td>${productName}</td>
                </tr>
                <tr>
                    <th>Quantity</th>
                    <td>${quantity}</td>
                </tr>
                <tr>
                    <th>Gross Amount</th>
                    <td>₹${grossAmount}</td>
                </tr>
                <tr>
                    <th>Discount</th>
                    <td>₹${discount}</td>
                </tr>
                <tr>
                    <th>Taxable Value</th>
                    <td>₹${taxableValue}</td>
                </tr>
                <tr>
                    <th>IGST</th>
                    <td>₹${igst}</td>
                </tr>
                <tr>
                    <th>Total Amount</th>
                    <td>₹${totalAmount}</td>
                </tr>
                <tr>
                    <th>Grand Total</th>
                    <td><strong>₹${grandTotal}</strong></td>
                </tr>
            </table>
            <p><strong>Billing Address:</strong><br>${billingAddress}</p>
            <p><strong>Shipping Address:</strong><br>${shippingAddress}</p>
            <p>If you have any questions, please feel free to contact us.</p>
            <p>Thank you,<br>Bharat Hast Kaushal</p>
        </div>
        <div class="footer">© 2024 Bharat Hast Kaushal. All rights reserved.</div>
    </body>
    </html>`;
    const text = `
    Hello ${customerName},
    Thank you for your purchase. Here are the details of your order:
    Order ID: ${orderId}
    Invoice Date: ${invoiceDate}
    Order Date: ${orderDate}
    Product Name: ${productName}
    Quantity: ${quantity}
    Gross Amount: ₹${grossAmount}
    Discount: ₹${discount}
    Taxable Value: ₹${taxableValue}
    IGST: ₹${igst}
    Total Amount: ₹${totalAmount}
    Grand Total: ₹${grandTotal}
    Billing Address:
    ${billingAddress}
    Shipping Address:
    ${shippingAddress}
    If you have any questions, please feel free to contact us.
    Thank you,
    Bharat Hast Kaushal`;
    return { html, text };
};