import { IsIP, IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { JOURNEY, JOURNEYTYPE } from '../../../libs/constants/flightConstant';


export class FlightRuleDto {
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @IsUUID()
  @IsNotEmpty()
  trace_id: string;

  @IsString()
  @IsNotEmpty()
  result_index: string;
}
export class FlightDetailRequestDto {
  @IsIP()
  @IsNotEmpty()
  ip_address: string;

  @IsUUID()
  @IsNotEmpty()
  trace_id: string;

  @IsString()
  @IsNotEmpty()
  result_index: string;

  @IsString()
  @IsNotEmpty()
  journey_type: JOURNEYTYPE;

  @IsString()
  @IsNotEmpty()
  journey: JOURNEY;

  // IB 

  // @IsUUID()
  // @IsOptional()
  // trace_id_ib?: string;

  @IsString()
  @IsOptional()
  result_index_ib?: string; 

}
