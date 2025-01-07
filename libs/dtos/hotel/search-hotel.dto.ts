import { IsString, IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

export class HotelSearchDto {
  @IsString()
  location: string;

  @IsString()
  check_in_date: string;

  @IsString()
  check_out_date: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rooms: number;

  @IsOptional()
  @IsString()
  city: string;

  @IsString()
  ip_address: string;

  @IsOptional()
  @IsNumber()
  adult_count:number;

  @IsOptional()
  @IsNumber()
  child_count:number;


}

// export class BlockRoomDto {
//   tokenId: string;
//   traceId: string;
//   roomIndices: number[]; // Room indices as per "Fixed" or "Open" combination
//   isVoucherBooking: boolean; // True or false
//   paxDetails: PaxDetails[];
// }
