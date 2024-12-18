import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchFlightDto {
    @IsString()
    @IsNotEmpty()
    origin: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @IsDateString()
    @IsNotEmpty()
    journey_date: string; 

    @IsString()
    @Type(() => String) 
    @IsNotEmpty()
    journey_type: string;

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
