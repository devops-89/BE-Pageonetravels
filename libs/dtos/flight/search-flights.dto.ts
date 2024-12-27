import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JOURNEY_TYPE, JOURNEYTYPEMAPPING } from '../../constants/flightConstant';
import { TimeFilter } from '../../constants/flightConstant';

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
    @IsOptional()
    origin: string;

    @IsString()
    @IsOptional()
    destination: string;

    @IsDateString()
    @IsOptional()
    departure_date: string; 

    @IsString()
    @IsOptional()
    preferred_time: string; 


    @IsDateString()
    @IsOptional()
    return_date: string; 

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MulticityItem)
    @IsOptional()
    multicity: MulticityItem[];

    @IsString()
    @IsOptional()
    // @IsNotEmpty({
    //     message: 'journey_type is required and cannot be empty',
    //   })
    //   @IsEnum(JOURNEY_TYPE, {
    //     message: `journey_type must be one of: ${Object.values(JOURNEY_TYPE).join(', ')}`,
    //   })
    journey_type: JOURNEYTYPEMAPPING;

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

    @IsString()
    // @Type(() => Number)
    @IsOptional()
    cabin_class: string;

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
    @IsOptional()
    cabin_class: string;

    @IsDateString()
    @IsOptional()
    departure_date: string;

    // @IsString()
    // @IsOptional() 
    // preferred_time: string; 
}
