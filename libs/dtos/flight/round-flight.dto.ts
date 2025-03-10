import { ValidateNested } from 'class-validator';
import { BookingDto,BookingNonLccDto } from './booking-flight.dto';
import { Type } from 'class-transformer';

export class RoundDto { 
    @ValidateNested()
    @Type(() => BookingDto)
    ob: BookingDto;

    @ValidateNested()
    @Type(() => BookingNonLccDto)
    ib: BookingNonLccDto;
    
}

