import { EnquiryType } from "../database/src/entities/enquiry.entity";
import { LOGO } from "../constants/commonConstants"; 

function wrapWithLayout(content: string, title: string): string {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: #2051A0; padding: 15px; text-align: center;">
        <img src="${LOGO}" alt="Company Logo" style="max-height: 50px; margin-bottom: 5px;" />
        <h1 style="color: #fff; margin: 0; font-size: 20px;">${title}</h1>
      </div>

      <!-- Body -->
      <div style="padding: 20px;">
        ${content}
      </div>

      <!-- Footer -->
      <div style="background-color: #f2940c; color: #fff; text-align: center; padding: 10px;">
        <p style="margin: 0; font-size: 14px;">This enquiry was submitted via our website.</p>
      </div>
    </div>
  `;
}

export function buildEnquiryTemplate(type: EnquiryType, body: any): string {
  switch (type) {
    case EnquiryType.ACTIVITIE:
      return wrapWithLayout(`
        <p><strong>Name:</strong> ${body.name}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Mobile:</strong> ${body.mobile}</p>
        <p><strong>Activity:</strong> ${body.activity}</p>
        <p><strong>Message:</strong> ${body.message}</p>
      `, "New Activity Enquiry");

    case EnquiryType.OUTSTATION_CABS:
      return wrapWithLayout(`
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Mobile:</strong> ${body.mobileNumber}</p>
        <p><strong>Pickup:</strong> ${body.pickupLocation}</p>
        <p><strong>Drop:</strong> ${body.dropLocation}</p>
        <p><strong>Number of Person:</strong> ${body.numberOfPerson}</p>
        <p><strong>Pickup Date:</strong> ${body.pickupDate}</p>
        <p><strong>Pickup Time:</strong> ${body.pickupTime}</p>
      `, "Outstation Cab Enquiry");

    case EnquiryType.CABS:
      return wrapWithLayout(`
        <p><strong>Name:</strong> ${body.fullName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p><strong>Taxi Type:</strong> ${body.taxiType}</p>
        <p><strong>Capacity:</strong> ${body.capacity}</p>
        <p><strong>Pickup:</strong> ${body.pickup}</p>
        <p><strong>Drop:</strong> ${body.drop}</p>
        <p><strong>Date:</strong> ${body.date}</p>
      `, "Cab Enquiry");

    case EnquiryType.SELF_DRIVE:
      return wrapWithLayout(`
        <p><strong>Name:</strong> ${body.fullName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p><strong>From Date:</strong> ${body.fromDate}</p>
        <p><strong>To Date:</strong> ${body.toDate}</p>
      `, "Self Drive Enquiry");

    case EnquiryType.DESTINATION_WEDDING:
      return wrapWithLayout(`
        <p><strong>Name:</strong> ${body.fullName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p><strong>Date:</strong> ${body.date}</p>
        <p><strong>Wedding Side:</strong> ${body.weddingSide}</p>
        <p><strong>Destination:</strong> ${body.destination}</p>
        <p><strong>Number of Guests:</strong> ${body.numberOfGuests}</p>
        <p><strong>Budget:</strong> ${body.budget}</p>
        <p><strong>Wedding Theme:</strong> ${body.weddingTheme}</p>
        <p><strong>Property Type:</strong> ${body.propertyType}</p>
        <p><strong>Food Type:</strong> ${body.foodType?.join(", ")}</p>
        <p><strong>Entry Vehicle:</strong> ${body.entryVehicle}</p>
        <p><strong>Music Theme:</strong> ${body.musicTheme}</p>
        <p><strong>Event Type:</strong> ${body.eventType?.join(", ")}</p>
        <p><strong>Clothing:</strong> ${body.clothing?.join(", ")}</p>
        <p><strong>Additional Services:</strong> ${body.additionalServices?.join(", ")}</p>
      `, "Destination Wedding Enquiry");

    case EnquiryType.HELICOPTER:
      return wrapWithLayout(`
        <p><strong>Name:</strong> ${body.fullName}</p>
        <p><strong>Email:</strong> ${body.email}</p>
        <p><strong>Phone:</strong> ${body.phoneNumber}</p>
        <p><strong>From:</strong> ${body.from}</p>
        <p><strong>To:</strong> ${body.to}</p>
        <p><strong>Date:</strong> ${body.date}</p>
        <p><strong>Time:</strong> ${body.time}</p>
        <p><strong>Adults:</strong> ${body.adults}</p>
        <p><strong>Children:</strong> ${body.children}</p>
        <p><strong>Message:</strong> ${body.message}</p>
      `, "Helicopter Enquiry");

    default:
      return wrapWithLayout(`
        <p style="color: #999;">No structured template available.</p>
        <pre>${JSON.stringify(body, null, 2)}</pre>
      `, "Unknown Enquiry Type");
  }
}
