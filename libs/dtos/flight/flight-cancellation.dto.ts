import {IsString, IsNumber,IsIP, IsOptional, IsArray, ValidateNested, IsIn, IsNotEmpty, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ReleasePNRRequestDto {
    @IsString()
    @IsNotEmpty()
    EndUserIp: string;

    @IsString()
    @IsNotEmpty()
    BookingId: string;

    @IsString()
    @IsNotEmpty()
    TokenId: string;

    @IsString()
    @IsNotEmpty()
    Source: string;
}
export class CancellationChargesRequestDto {
    @IsString()
    @IsNotEmpty()
    BookingId: string;

    @IsString()
    @IsNotEmpty()
    RequestType: string; // "1" for Full Cancellation, "2" for Partial Cancellation

    @IsString()
    @IsNotEmpty()
    BookingMode: string; // "5" for API mode

    @IsString()
    @IsNotEmpty()
    EndUserIp: string;

    // @IsString()
    // @IsNotEmpty()
    // TokenId: string;
}
export class SendChangeRequestDto {
    @IsString()
    @IsNotEmpty()
    remarks: string;

    @IsString()
    @IsNotEmpty()
    orderId: string;

    @IsIP()
    @IsNotEmpty()
    ip: string;
}

export class SectorDto {
    @IsString()
    @IsNotEmpty()
    Origin: string;
    @IsString()
    @IsNotEmpty()
    Destination: string;
}
export class GetChangeRequestDto {
    @IsString()
    @IsNotEmpty()
    ChangeRequestId: string;

    @IsString()
    @IsNotEmpty()
    EndUserIp: string;

    @IsString()
    @IsNotEmpty()
    TokenId: string;
}
export class CancelFlightTicketDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;

    @IsNumber()
    @IsOptional()
    requestType?: number; // 1 for Full Cancellation, 2 for Partial Cancellation

    @IsString()
    @IsOptional()
    userEmail?: string;

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SectorDto)
    sectors?: SectorDto[];
    @IsArray()
    @IsOptional()
    ticketIds?: number[];
}
export class PartialCancellationDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SectorDto)
    sectors: SectorDto[];

    @IsArray()
    ticketIds: number[];

    @IsString()
    @IsOptional()
    remarks?: string;

    @IsString()
    @IsOptional()
    userEmail?: string;
}
export class GetCancellationChargesDto {
    @IsString()
    @IsNotEmpty()
    bookingId: string;

    @IsString()
    @IsNotEmpty()
    requestType: string; // "1" for Full, "2" for Partial

    @IsString()
    @IsNotEmpty()
    bookingMode: string; // "5" for API mode

    @IsString()
    @IsNotEmpty()
    endUserIp: string;

    @IsString()
    @IsNotEmpty()
    tokenId: string;
}
