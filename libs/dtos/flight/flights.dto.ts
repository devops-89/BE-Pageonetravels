import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';
import { JOURNEY_TYPE } from 'libs/constants/flightConstant';

export class SearchFlightDto {
    @IsString()
    @IsOptional()
    min_price: string;

    @IsString()
    @IsOptional()
    max_price: string;

    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsDateString()
    @IsNotEmpty()
    departure_date: string; 

    @IsDateString()
    @IsNotEmpty()
    preferred_time: string; 

    @IsDateString()
    @IsNotEmpty()
    return_date: string; 

    @IsArray()
    @IsOptional()
    @IsArray({ each: true }) // Ensures every element is validated against the class
    multicity: MulticityItem[];

    @IsString()
    // @Type(() => enum) 
    @IsNotEmpty()
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
    @Length(3, 4) // Ensures time is 3 or 4 characters (e.g., '090' or '0900')
    @IsNotEmpty()
    preferred_time: string;
}
