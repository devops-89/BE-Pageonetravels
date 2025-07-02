# Flight Cancellation API Documentation

This document provides comprehensive information about the flight cancellation APIs integrated into the Page1Travels system.

## Overview

The flight cancellation system supports both full and partial cancellations for flight bookings. The system integrates with TBO (Travel Boutique Online) APIs to provide seamless cancellation functionality.

## API Endpoints

### 1. Release PNR Request

**Endpoint:** `POST /flight-booking/release-pnr`

**Description:** Releases a PNR (Passenger Name Record) for a booking.

**Request Body:**
```json
{
  "bookingId": "1288527",
  "endUserIp": "192.168.10.36",
  "tokenId": "ebf966ff-9e72-4fc2-a63d-2236a91f7152"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ResponseStatus": 1,
    "TraceId": "1eaf3154-621f-4b6d-b942-9ef0857c3e60",
    "Error": {
      "ErrorCode": 0,
      "ErrorMessage": ""
    }
  }
}
```

### 2. Get Cancellation Charges

**Endpoint:** `POST /flight-booking/get-cancellation-charges`

**Description:** Retrieves cancellation charges for a booking before proceeding with cancellation.

**Request Body:**
```json
{
  "bookingId": "1583080",
  "requestType": "2",
  "bookingMode": "5",
  "endUserIp": "192.168.10.23",
  "tokenId": "b5011adf-2ac8-4bc7-9550-70870e016150"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ResponseStatus": 1,
    "TraceId": "040d3c33-b279-468f-bd78-b68e8df19cd8",
    "RefundAmount": 2413,
    "CancellationCharge": 8532,
    "Remarks": "Infant added later Onwards",
    "Currency": "INR"
  },
  "refundAmount": 2413,
  "cancellationCharge": 8532
}
```

### 3. Send Change Request (Full Cancellation)

**Endpoint:** `POST /flight-booking/send-change-request`

**Description:** Sends a change request for full cancellation of a booking.

**Request Body:**
```json
{
  "bookingId": "1907823",
  "requestType": 1,
  "cancellationType": 3,
  "remarks": "Test remarks",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "B2B2BStatus": false,
    "TicketCRInfo": [
      {
        "ChangeRequestId": 309390,
        "TicketId": 2194072,
        "Status": 1,
        "Remarks": "Ticket is Cancelled Successfully | Ticket Id: 2194072",
        "ChangeRequestStatus": 4,
        "CancellationCharge": 793.0000,
        "RefundedAmount": 304.0000,
        "ServiceTaxOnRAF": 0.00,
        "SwachhBharatCess": 0.00,
        "KrishiKalyanCess": 0.00,
        "CreditNoteNo": "IE/2425/1195",
        "CreditNoteCreatedOn": "2024-07-11T19:07:14"
      }
    ],
    "ResponseStatus": 1,
    "TraceId": "1a67c9a7-1610-4f59-8069-c0cb2795c113"
  },
  "changeRequestId": 309390
}
```

### 4. Send Change Request (Partial Cancellation)

**Endpoint:** `POST /flight-booking/send-change-request`

**Description:** Sends a change request for partial cancellation of specific sectors.

**Request Body:**
```json
{
  "bookingId": "1288166",
  "requestType": 2,
  "cancellationType": 3,
  "sectors": [
    {
      "origin": "DEL",
      "destination": "SVO"
    }
  ],
  "ticketIds": [1567415, 1567416],
  "remarks": "Test remarks",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "TicketCRInfo": [
      {
        "ChangeRequestId": 195187,
        "Status": 1,
        "Remarks": "Successful"
      },
      {
        "ChangeRequestId": 195188,
        "Status": 1,
        "Remarks": "Successful"
      }
    ],
    "ResponseStatus": 1,
    "TraceId": ""
  },
  "changeRequestId": 195187
}
```

### 5. Get Change Request Status

**Endpoint:** `GET /flight-booking/change-request-status/:changeRequestId`

**Description:** Retrieves the status of a change request using the change request ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "ResponseStatus": 1,
    "Error": null,
    "TraceId": "120e537c-fbe8-463d-a52b-5653b38ab87b",
    "ChangeRequestId": 199350,
    "RefundedAmount": 3560.0000,
    "CancellationCharge": 100.0000,
    "ServiceTaxOnRAF": 12.36,
    "ChangeRequestStatus": 4
  },
  "refundAmount": 3560.0000,
  "cancellationCharge": 100.0000
}
```

### 6. Cancel Flight Ticket (New Comprehensive Method)

**Endpoint:** `POST /flight-booking/cancel-flight-ticket-new`

**Description:** Comprehensive method that handles the entire cancellation process including getting charges and sending change request.

**Request Body:**
```json
{
  "bookingId": "1907823",
  "requestType": 1,
  "userEmail": "user@example.com",
  "remarks": "Customer requested cancellation",
  "sectors": [
    {
      "origin": "DEL",
      "destination": "BOM"
    }
  ],
  "ticketIds": [2194072]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "B2B2BStatus": false,
    "TicketCRInfo": [
      {
        "ChangeRequestId": 309390,
        "TicketId": 2194072,
        "Status": 1,
        "Remarks": "Ticket is Cancelled Successfully | Ticket Id: 2194072",
        "ChangeRequestStatus": 4,
        "CancellationCharge": 793.0000,
        "RefundedAmount": 304.0000
      }
    ],
    "ResponseStatus": 1,
    "TraceId": "1a67c9a7-1610-4f59-8069-c0cb2795c113"
  },
  "cancellationCharges": {
    "ResponseStatus": 1,
    "RefundAmount": 304,
    "CancellationCharge": 793,
    "Remarks": "Cancellation charges applied",
    "Currency": "INR"
  },
  "changeRequestId": 309390,
  "refundAmount": 304,
  "cancellationCharge": 793
}
```

### 7. Partial Cancellation

**Endpoint:** `POST /flight-booking/partial-cancellation`

**Description:** Dedicated endpoint for partial cancellations.

**Request Body:**
```json
{
  "bookingId": "1288166",
  "sectors": [
    {
      "origin": "DEL",
      "destination": "SVO"
    }
  ],
  "ticketIds": [1567415, 1567416],
  "remarks": "Partial cancellation for specific sectors",
  "userEmail": "user@example.com"
}
```

### 8. Get Airline Types

**Endpoint:** `GET /flight-booking/airline-types`

**Description:** Retrieves information about different airline types (NDC, LCC, GDS).

**Response:**
```json
{
  "success": true,
  "data": {
    "ndc": [
      { "code": "EK", "name": "Emirates", "type": "NDC" },
      { "code": "LH", "name": "Lufthansa", "type": "NDC" },
      { "code": "WY", "name": "Oman Air", "type": "NDC" },
      { "code": "EY", "name": "Etihad Airways", "type": "NDC" },
      { "code": "GF", "name": "Gulf Air", "type": "NDC" }
    ],
    "lcc": [
      { "code": "6E", "name": "IndiGo", "type": "LCC" },
      { "code": "IX", "name": "Air India Express", "type": "LCC" },
      { "code": "SG", "name": "SpiceJet", "type": "LCC" },
      { "code": "FZ", "name": "FlyDubai", "type": "LCC" },
      { "code": "QP", "name": "Akasa Air", "type": "LCC" }
    ],
    "message": "Airline types retrieved successfully"
  }
}
```

## Constants and Types

### Cancellation Types
- `1`: Full Cancellation
- `2`: Partial Cancellation  
- `3`: Sector Cancellation

### Request Types
- `1`: Full Cancellation
- `2`: Partial Cancellation

### Booking Modes
- `"5"`: API Mode

### Airline Types
- **NDC (New Distribution Capability)**: Emirates, Lufthansa, Oman Air, Etihad Airways, Gulf Air
- **LCC (Low-Cost Carrier)**: IndiGo, Air India Express, SpiceJet, FlyDubai, Akasa Air
- **GDS (Global Distribution System)**: All other airlines

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description",
  "statusCode": 400
}
```

## Email Notifications

When a `userEmail` is provided in cancellation requests, the system automatically sends cancellation confirmation emails using the existing email service.

## Legacy Support

The original `POST /flight-booking/cancel-ticket` endpoint is maintained for backward compatibility.

## Implementation Notes

1. **Authentication**: All API calls require valid TBO credentials and tokens
2. **Rate Limiting**: Consider implementing rate limiting for cancellation requests
3. **Logging**: All cancellation activities are logged for audit purposes
4. **Database Updates**: Cancellation status is updated in the order database
5. **Email Templates**: Uses existing cancellation confirmation email templates

## Usage Examples

### Full Cancellation Flow
1. Call `get-cancellation-charges` to check charges
2. Call `send-change-request` with `requestType: 1`
3. Optionally call `change-request-status` to check status

### Partial Cancellation Flow
1. Call `send-change-request` with `requestType: 2` and sector details
2. Provide `ticketIds` for specific tickets to cancel
3. Monitor status using `change-request-status`

### Simplified Cancellation
Use `cancel-flight-ticket-new` for a complete cancellation process in one call.

## Security Considerations

- All endpoints validate input parameters
- Authentication tokens are required for all operations
- User permissions should be checked before allowing cancellations
- Sensitive booking information is protected
- Audit trails are maintained for all cancellation activities
``` 