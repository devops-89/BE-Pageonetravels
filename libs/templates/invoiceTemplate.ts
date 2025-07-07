// import { LOGO } from '../constants/commonConstants';
// export const invoiceEmailTemplate = function (invoiceData: any) {
//     const {
//         orderId,
//         customerName,
//         billingAddress,
//         shippingAddress,
//         invoiceDate,
//         orderDate,
//         productName,
//         quantity,
//         grossAmount,
//         discount,
//         taxableValue,
//         igst,
//         totalAmount,
//         grandTotal
//     } = invoiceData;
//     const html = `
//     <!DOCTYPE html>
//     <html lang="en">
//     <head>
//         <meta charset="UTF-8">
//         <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         <title>Invoice for Order ${orderId}</title>
//         <style>
//             body { font-family: Arial, sans-serif; background-color: #F7F7F7; margin: 0; padding: 20px; }
//             .container { background-color: #FFFFFF; padding: 20px; border-radius: 5px; }
//             h1 { color: #333; }
//             .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             table, th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//         </style>
//     </head>
//     <body>
//         <div class="container">
//             <h1>Hello ${customerName},</h1>
//             <p>Thank you for your purchase. Here are the details of your order:</p>
//             <table>
//                 <tr>
//                     <th>Order ID</th>
//                     <td>${orderId}</td>
//                 </tr>
//                 <tr>
//                     <th>Invoice Date</th>
//                     <td>${invoiceDate}</td>
//                 </tr>
//                 <tr>
//                     <th>Order Date</th>
//                     <td>${orderDate}</td>
//                 </tr>
//                 <tr>
//                     <th>Product Name</th>
//                     <td>${productName}</td>
//                 </tr>
//                 <tr>
//                     <th>Quantity</th>
//                     <td>${quantity}</td>
//                 </tr>
//                 <tr>
//                     <th>Gross Amount</th>
//                     <td>₹${grossAmount}</td>
//                 </tr>
//                 <tr>
//                     <th>Discount</th>
//                     <td>₹${discount}</td>
//                 </tr>
//                 <tr>
//                     <th>Taxable Value</th>
//                     <td>₹${taxableValue}</td>
//                 </tr>
//                 <tr>
//                     <th>IGST</th>
//                     <td>₹${igst}</td>
//                 </tr>
//                 <tr>
//                     <th>Total Amount</th>
//                     <td>₹${totalAmount}</td>
//                 </tr>
//                 <tr>
//                     <th>Grand Total</th>
//                     <td><strong>₹${grandTotal}</strong></td>
//                 </tr>
//             </table>
//             <p><strong>Billing Address:</strong><br>${billingAddress}</p>
//             <p><strong>Shipping Address:</strong><br>${shippingAddress}</p>
//             <p>If you have any questions, please feel free to contact us.</p>
//             <p>Thank you,<br>Page One Travels</p>
//         </div>
//         <div class="footer">© 2024 Page One Travels. All rights reserved.</div>
//     </body>
//     </html>`;
//     const text = `
//     Hello ${customerName},
//     Thank you for your purchase. Here are the details of your order:
//     Order ID: ${orderId}
//     Invoice Date: ${invoiceDate}
//     Order Date: ${orderDate}
//     Product Name: ${productName}
//     Quantity: ${quantity}
//     Gross Amount: ₹${grossAmount}
//     Discount: ₹${discount}
//     Taxable Value: ₹${taxableValue}
//     IGST: ₹${igst}
//     Total Amount: ₹${totalAmount}
//     Grand Total: ₹${grandTotal}
//     Billing Address:
//     ${billingAddress}
//     Shipping Address:
//     ${shippingAddress}
//     If you have any questions, please feel free to contact us.
//     Thank you,
//     Page One Travels`;
//     return { html, text };
// };


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../../../../libs/database/src/dto/entities/address.entity';
import { User } from '../../../../libs/database/src/entities/user.entity';
import { InvoiceDetailsDto } from '../../../../libs/database/src/dto/invoice-details.dto';

@Injectable()
export class InvoiceService {
    constructor(
        @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
        @InjectRepository(User) private readonly userRepository: Repository<User>
    ) {}

    /**
     * Generate a detailed flight invoice.
     * @param invoiceDetails Details required for generating the invoice.
     */
    async generateFlightInvoice(invoiceDetails: InvoiceDetailsDto): Promise<string> {
        try {
            const { userId, flightDetails, passengerDetails, bookingDetails } = invoiceDetails;

            // Fetch user details
            const user = await this.userRepository.findOne({ where: { id: userId } });
            if (!user) {
                throw new Error('User not found.');
            }

            // Fetch address details if required
            const address = user.addresses?.find(addr => addr.isdefault) ?? null;

            // Construct the HTML template for the invoice
            const invoiceHtml = `
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
                    .container { width: 90%; margin: 20px auto; padding: 20px; background: #fff; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
                    .header { display: flex; justify-content: space-between; align-items: center; }
                    .logo { width: 120px; }
                    .details { text-align: right; }
                    .details h4 { margin: 0; }
                    .flight-info, .passenger-info, .summary { margin: 20px 0; }
                    .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    .table th { background: #2051a0; color: #fff; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #555; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <img src="path-to-logo" alt="Logo" class="logo" />
                        <div class="details">
                            <h4>Flight Invoice</h4>
                            <p>Booking ID: ${bookingDetails.bookingId}</p>
                            <p>Issue Date: ${bookingDetails.issueDate}</p>
                        </div>
                    </div>
                    <div class="flight-info">
                        <h3>Flight Details</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Flight</th>
                                    <th>Departure</th>
                                    <th>Arrival</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${flightDetails.map(flight => `
                                    <tr>
                                        <td>${flight.flightNumber}</td>
                                        <td>${flight.departure.city} (${flight.departure.code}) - ${flight.departure.time}</td>
                                        <td>${flight.arrival.city} (${flight.arrival.code}) - ${flight.arrival.time}</td>
                                        <td>${flight.status}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="passenger-info">
                        <h3>Passenger Details</h3>
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Seat</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${passengerDetails.map(passenger => `
                                    <tr>
                                        <td>${passenger.name}</td>
                                        <td>${passenger.type}</td>
                                        <td>${passenger.seat || '-'}</td>
                                    </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="summary">
                        <h3>Summary</h3>
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th>Base Fare</th>
                                    <td>${bookingDetails.baseFare}</td>
                                </tr>
                                <tr>
                                    <th>Taxes</th>
                                    <td>${bookingDetails.taxes}</td>
                                </tr>
                                <tr>
                                    <th>Total</th>
                                    <td>${bookingDetails.totalFare}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="footer">
                        <p>This is a computer-generated invoice. No signature is required.</p>
                    </div>
                </div>
            </body>
            </html>`;

            return invoiceHtml;
        } catch (error) {
            console.error('Error generating flight invoice:', error);
            throw error;
        }
    }
}
