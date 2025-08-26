// / room-types/dto/generate-oinventory.dto.ts
import { IsUUID } from "class-validator";
import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';
export class GenerateInventoryDto {
    @IsUUID('4')
    roomTypeId: string; // Room type ID to generate inventory for
    @IsDateString() startDate: string; // YYYY-MM-DD
    @IsInt() @Min(1) days: number; // number of days to generate
}
// inventory/dto/search-availability.dto.ts
export class SearchAvailabilityDto {
    @IsString() city: string;
    @IsDateString() checkIn: string;
    @IsDateString() checkOut: string;
    @IsInt() @Min(1) rooms: number;
    @IsOptional() @IsInt() hotelId?: number; // optional filter
}











