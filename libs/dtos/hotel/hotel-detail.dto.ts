import { IsIP, IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class HotelDetailRequestDto {
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @IsUUID()
  @IsNotEmpty()
  token: string;

  @IsUUID()
  @IsNotEmpty()
  trace_id: string;

  @IsString()
  @IsNotEmpty()
  result_index: string;
}
