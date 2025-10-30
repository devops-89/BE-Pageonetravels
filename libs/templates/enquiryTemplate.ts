import { EnquiryType } from '../database/src/entities/enquiry.entity';
import { LOGO } from '../constants/commonConstants';

function wrapWithLayout(content: string, title: string): string {
    return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">


      <!-- EMAIL HEADER START -->

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; overflow:hidden; box-shadow:0px 2px 10px rgba(0,0,0,0.1);">
<tr>
<td align="center" style="background:#f8f8f8; padding:18px;">
  <img src="${LOGO}" alt="Company Logo" style="max-height: 50px; margin-bottom: 5px;" />
</td>
</tr>
</table>


      <!-- Body -->
      <div style="padding: 20px; background: #FFFFFF; text-align:left;">
      <p style="font-size:16px; color:#555; >Hello Sir/Mam,</p>
      <p style="font-size:14px; color:#555; text-align:left; ">Thank you for contacting <strong>Page1Travels</strong>! We’ve received your enquiry related to our <strong>${title}</strong> service. Our travel expert team is now reviewing your request and will connect with you shortly.</p>
      <p style="font-size:16px; color:#555; text-align:left; ">Below are your enquiry details:</p>

        ${content}
      </div>

      <!-- EMAIL FOOTER START -->
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8f8; padding:18px; text-align:center; border-top:1px solid #eee; font-family:Arial, sans-serif;">
    <tr>
        <td style="font-size:14px; color:#555;">
            <p style="margin:6px 0;">If you need assistance, we’re always here to help! 😊</p>
            <p style="margin:6px 0;">
                📞 <strong>+91-7977512494</strong> &nbsp; | &nbsp;
                ✉ <strong>info@page1travels.com</strong>
            </p>
        </td>
    </tr>
    <tr>
        <td style="font-size:12px; color:#888; padding-top:10px;">
            <p style="margin:6px 0;">You are receiving this email because you submitted a service enquiry on <strong>Page1Travels</strong>.</p>
            <p style="margin:6px 0;">© 2025 Page1Travels — All Rights Reserved.</p>
        </td>
    </tr>
</table>
<!-- EMAIL FOOTER END -->
    </div>
  `;
}

export function buildEnquiryTemplate(type: EnquiryType, body: any): string {
    switch (type) {
        case EnquiryType.ACTIVITIE:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Name:</strong> ${body.name}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Mobile:</strong> ${body.mobile}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Activity:</strong> ${body.activity}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Message:</strong> ${body.message}</p>
      `,
                'New Activity Enquiry'
            );

        case EnquiryType.OUTSTATION_CABS:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Mobile:</strong> ${body.mobileNumber}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Pickup:</strong> ${body.pickupLocation}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Drop:</strong> ${body.dropLocation}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Number of Person:</strong> ${body.numberOfPerson}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Pickup Date:</strong> ${body.pickupDate}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Pickup Time:</strong> ${body.pickupTime}</p>
      `,
                'Outstation Cab Enquiry'
            );

        case EnquiryType.CABS:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Name:</strong> ${body.fullName}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Taxi Type:</strong> ${body.taxiType}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Capacity:</strong> ${body.capacity}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Pickup:</strong> ${body.pickup}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Drop:</strong> ${body.drop}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Date:</strong> ${body.date}</p>
      `,
                'Cab Enquiry'
            );

        case EnquiryType.SELF_DRIVE:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Name:</strong> ${body.fullName}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>From Date:</strong> ${body.fromDate}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>To Date:</strong> ${body.toDate}</p>
      `,
                'Self Drive Enquiry'
            );

        case EnquiryType.DESTINATION_WEDDING:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Name:</strong> ${body.fullName}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Date:</strong> ${body.date}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Wedding Side:</strong> ${body.weddingSide}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Destination:</strong> ${body.destination}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Number of Guests:</strong> ${body.numberOfGuests}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Budget:</strong> ${body.budget}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Wedding Theme:</strong> ${body.weddingTheme}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Property Type:</strong> ${body.propertyType}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Food Type:</strong> ${body.foodType?.join(', ')}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Entry Vehicle:</strong> ${body.entryVehicle}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Music Theme:</strong> ${body.musicTheme}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Event Type:</strong> ${body.eventType?.join(', ')}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Clothing:</strong> ${body.clothing?.join(', ')}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Additional Services:</strong> ${body.additionalServices?.join(', ')}</p>
      `,
                'Destination Wedding Enquiry'
            );

        case EnquiryType.HELICOPTER:
            return wrapWithLayout(
                `
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Name:</strong> ${body.fullName}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Email:</strong> ${body.email}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>From:</strong> ${body.from}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>To:</strong> ${body.to}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Date:</strong> ${body.date}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Time:</strong> ${body.time}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Adults:</strong> ${body.adults}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Children:</strong> ${body.children}</p>
        <p style="font-size:16px; color:#555; text-align:left;"><strong>Message:</strong> ${body.message}</p>
      `,
                'Helicopter Enquiry'
            );

        default:
            return wrapWithLayout(
                `
        <p style="color: #999;">No structured template available.</p>
        <pre>${JSON.stringify(body, null, 2)}</pre>
      `,
                'Unknown Enquiry Type'
            );
    }
}
