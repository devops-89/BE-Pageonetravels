export class GetCancellationChargesDto {
  EndUserIp: string;
  RequestType: number; // 1, 2, or 3
  BookingId: number;
  BookingMode?: number; // Optional (default to 5)
}