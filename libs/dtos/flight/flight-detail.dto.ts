import { IsIP, IsUUID, IsString, IsNotEmpty, IsOptional, IsEnum, isNotEmpty } from 'class-validator';
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

export class GetAgencyBalanceDto {
    @IsNotEmpty()
    @IsIP()
    EndUserIp: string;
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

    @IsEnum(JOURNEYTYPE, {
        message: `type must be one of the following: ${Object.values(JOURNEYTYPE).join(', ')}`,
    })
    @IsNotEmpty()
    journey_type: JOURNEYTYPE;

    @IsEnum(JOURNEY, {
        message: `type must be one of the following: ${Object.values(JOURNEY).join(', ')}`,
    })
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
