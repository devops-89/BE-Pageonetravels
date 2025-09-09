// / room-types/dto/generate-oinventory.dto.ts
import { IsUUID } from "class-validator";
import { IsDateString, IsInt, IsOptional,IsBoolean, IsString, Min, ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,} from 'class-validator';
import { Type } from 'class-transformer';

export class InventoryItemDto {
  @IsDateString()
  date: string; 

  @IsBoolean()
  available: boolean; // true = open for sale, false = closed

  @IsOptional()
  @IsInt()
  @Min(0)
  rooms?: number; // available rooms for this date (if omitted & available=true -> fallback logic)

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number; // override price for this date (falls back to room base price if null)
}

export class GenerateInventoryDto {
  @IsUUID('4')
  roomTypeId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(60) // guardrails: at most 60 dates per request (tune as you like)
  @ValidateNested({ each: true })
  @Type(() => InventoryItemDto)
  inventory: InventoryItemDto[];
}
// inventory/dto/search-availability.dto.ts
export class SearchAvailabilityDto {
    @IsString() city: string;
    @IsDateString() checkIn: string;
    @IsDateString() checkOut: string;
    @IsInt() @Min(1) rooms: number;
  @IsOptional()
    @IsUUID()           
    hotelId?: string;   
}











