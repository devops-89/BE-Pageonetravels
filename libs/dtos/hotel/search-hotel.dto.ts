import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class SearchHotelDto {
  @IsString()
  location: string;

  @IsString()
  check_in: string;

  @IsString()
  check_out: string;

  @IsInt()
  @Min(1)
  guests: number;

  @IsInt()
  @Min(1)
  @Max(5)
  rooms: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsString()
  ip_address: string;
}
