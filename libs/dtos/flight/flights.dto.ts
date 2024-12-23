import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { JOURNEY_TYPE } from '../../../libs/constants/flightConstant';
import { TimeFilter } from '../../../libs/constants/flightConstant';

export class SearchFlightDto {
    @IsString()
    @IsOptional()
    min_price: string;

    @IsString()
    @IsOptional()
    max_price: string;

    @IsString()
    @IsNotEmpty()
    ip_address: string;

    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsDateString()
    @IsNotEmpty()
    departure_date: string; 

    @IsString()
    @IsNotEmpty({
        message: 'preferred_time is required and cannot be empty',
      })
      @IsEnum(TimeFilter, {
        message: `preferred_time must be one of: ${Object.values(TimeFilter).join(', ')}`,
      })
    preferred_time: TimeFilter; 


    @IsDateString()
    @IsOptional()
    return_date: string; 

    @IsArray()
    @IsOptional()
    @IsArray({ each: true })
    multicity: MulticityItem[];

    @IsString()
    @IsNotEmpty({
        message: 'journey_type is required and cannot be empty',
      })
      @IsEnum(JOURNEY_TYPE, {
        message: `journey_type must be one of: ${Object.values(JOURNEY_TYPE).join(', ')}`,
      })
    journey_type: JOURNEY_TYPE;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    adult: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    child: number;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    infant: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    cabin_class: number;

    @IsBoolean()
    @IsOptional()
    direct_flight: boolean;

    @IsBoolean()
    @IsOptional()
    one_stop_flight: boolean;

}

class MulticityItem {
    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsString()
    @IsNotEmpty()
    cabin_class: string;

    @IsDateString()
    @IsNotEmpty()
    departure_date: string;

    @IsString()
    @IsNotEmpty()
    preferred_time: string;
}
