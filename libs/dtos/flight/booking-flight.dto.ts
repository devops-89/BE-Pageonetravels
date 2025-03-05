import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsDateString,
    ValidateNested,
    IsArray,
    IsIn,
    IsNotEmpty,
    ArrayMinSize,
    MinLength,
    IsInt,
    IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { JOURNEY, JOURNEYTYPE } from 'libs/constants/flightConstant';





export class PassengerDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsInt()
    @IsIn([1, 2, 3], { message: 'pax_type must be 1 (Adult), 2 (Child), or 3 (Infant)' })
    pax_type: number; // 1: Adult, 2: Child, 3: Infant

    @IsDateString()
    @IsNotEmpty()
    date_of_birth: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsOptional()
    @IsString()
    passport_no?: string | null;

    @IsOptional()
    @IsDateString()
    passport_expiry?: string | null;

    @IsString()
    @IsNotEmpty()
    contact_no: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsBoolean()
    is_lead_pax: boolean;

    @IsOptional()
    @IsString()
    ff_airline_code?: string | null;

    @IsOptional()
    @IsString()
    ff_number?: string | null;

    // Optional baggage, meal, and seat details
    @IsOptional()
    @ValidateNested()
    @Type(() => BaggageDto)
    baggage?: BaggageDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => MealDynamicDto)
    mealDynamic?: MealDynamicDto[];

    @IsOptional()
    @ValidateNested()
    @Type(() => SeatDynamicDto)
    seatDynamic?: SeatDynamicDto[];
}


export class PassengerDetailsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PassengerDto)
    @ArrayMinSize(1, { message: 'At least one adult is required' })
    adult: PassengerDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PassengerDto)
    child: PassengerDto[] = [];  // Default empty array

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PassengerDto)
    infant: PassengerDto[] = []; // Default empty array

}



export class FareDto {
    @IsString()
    Currency: string;

    @IsNumber()
    BaseFare: number;

    @IsNumber()
    Tax: number;

    @IsNumber()
    YQTax: number;

    @IsNumber()
    AdditionalTxnFeeOfrd: number;

    @IsNumber()
    AdditionalTxnFeePub: number;

    @IsNumber()
    OtherCharges: number;

    @IsNumber()
    Discount: number;

    @IsNumber()
    PublishedFare: number;

    @IsNumber()
    OfferedFare: number;

    @IsNumber()
    TdsOnCommission: number;

    @IsNumber()
    TdsOnPLB: number;

    @IsNumber()
    TdsOnIncentive: number;

    @IsNumber()
    ServiceFee: number;
}

export class FareBreakdownDto {
    @IsString()
    Currency: string;

    @IsNumber()
    PassengerType: number;

    @IsNumber()
    PassengerCount: number;

    @IsNumber()
    BaseFare: number;

    @IsNumber()
    Tax: number;

    @IsNumber()
    YQTax: number;

    @IsNumber()
    AdditionalTxnFeeOfrd: number;

    @IsNumber()
    AdditionalTxnFeePub: number;
}

export class BookingNonLccDto {
    @IsString()
    result_index: string;

    @IsString()
    ip_address: string;

    @IsString()
    cell_country_code: string;

    @IsEnum(JOURNEYTYPE, { 
        message: `type must be one of the following: ${Object.values(JOURNEYTYPE).join(', ')}` 
    })
    @IsNotEmpty()
    journey_type: JOURNEYTYPE;
    
    
    @IsEnum(JOURNEY, { 
      message: `type must be one of the following: ${Object.values(JOURNEY).join(', ')}` 
    })
    @IsNotEmpty()
    journey: JOURNEY;

    @IsBoolean()
    @IsNotEmpty()
    is_LCC: boolean;

    @IsBoolean()
    @IsOptional()
    is_LCC_round ?: boolean;    


    @IsString()
    country_code: string;

    @IsString()
    city: string;

    @IsString()
    contact_no: string;

    @IsString()
    country: string;

    @IsString()
    house_number: string;

    @IsString()
    postal_code: string;

    @IsString()
    street: string;

    @IsString()
    state: string;

    @IsString()
    nationality: string;

    @IsString()
    email: string;

    @IsString()
    trace_id: string;

    @ValidateNested()
    @Type(() => PassengerDetailsDto)
    @IsNotEmpty()
    passenger_details: PassengerDetailsDto;

    @IsOptional()
    @IsString()
    gst_company_address?: string;

    @IsOptional()
    @IsString()
    gst_company_contact_number?: string;

    @IsOptional()
    @IsString()
    gst_company_name?: string;

    @IsOptional()
    @IsString()
    gst_number?: string;

    @IsOptional()
    @IsString()
    gst_company_email?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FareDto)
    @IsNotEmpty()
    fare: FareDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FareBreakdownDto)
    @IsNotEmpty()
    fareBreakdown: FareBreakdownDto[];

    
}

export class TicketDto {
    @IsString()
    ip_address: string;

    @IsString()
    tokenId: string;

    @IsString()
    traceId: string;

    @IsString()
    pnr: string;

    @IsNumber()
    bookingId: number;
}



// class MealDetailDto {
//     @IsString()
//     AirlineCode: string;
  
//     @IsString()
//     FlightNumber: string;
  
//     @IsNumber()
//     WayType: number;
  
//     @IsString()
//     Code: string;
  
//     @IsNumber()
//     Description: number;
  
//     @IsString()
//     AirlineDescription: string;
  
//     @IsNumber()
//     Quantity: number;
  
//     @IsString()
//     Currency: string;
  
//     @IsNumber()
//     Price: number;
  
//     @IsString()
//     Origin: string;
  
//     @IsString()
//     Destination: string;
//   }
  
//   class MealTypeDto {
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => MealDetailDto)
//     adult: MealDetailDto[];
  
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => MealDetailDto)
//     @IsOptional()
//     child?: MealDetailDto[];
  
//     @IsArray()
//     @ValidateNested({ each: true })
//     @Type(() => MealDetailDto)
//     @IsOptional()
//     infant?: MealDetailDto[];
//   }
  



export class BookingDto{
    @IsString()
    result_index: string;

    @IsString()
    ip_address: string;

    @IsString()
    cell_country_code: string;

    @IsEnum(JOURNEYTYPE, { 
        message: `type must be one of the following: ${Object.values(JOURNEYTYPE).join(', ')}` 
    })
    @IsNotEmpty()
    journey_type: JOURNEYTYPE;
    
    
    @IsEnum(JOURNEY, { 
      message: `type must be one of the following: ${Object.values(JOURNEY).join(', ')}` 
    })
    @IsNotEmpty()
    journey: JOURNEY;

    @IsBoolean()
    @IsNotEmpty()
    is_LCC: boolean;


    @IsString()
    country_code: string;

    @IsString()
    city: string;

    @IsString()
    contact_no: string;

    @IsString()
    country: string;

    @IsString()
    house_number: string;

    @IsString()
    postal_code: string;

    @IsString()
    street: string;

    @IsString()
    state: string;

    @IsString()
    nationality: string;

    @IsString()
    email: string;

    @IsString()
    trace_id: string;

    @ValidateNested()
    @Type(() => PassengerDetailsDto)
    @IsNotEmpty()
    passenger_details: PassengerDetailsDto;

    @IsOptional()
    @IsString()
    gst_company_address?: string;

    @IsOptional()
    @IsString()
    gst_company_contact_number?: string;

    @IsOptional()
    @IsString()
    gst_company_name?: string;

    @IsOptional()
    @IsString()
    gst_number?: string;

    @IsOptional()
    @IsString()
    gst_company_email?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FareDto)
    @IsNotEmpty()
    fare: FareDto[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FareBreakdownDto)
    @IsNotEmpty()
    fareBreakdown: FareBreakdownDto[];

    
    // @ValidateNested()
    // @Type(() => MealTypeDto)
    // @IsOptional()
    // meals: MealTypeDto;
   
}




//seat meal baggage
export class BaggageDto {
    @IsString()
    @IsOptional()
    AirlineCode?: string;

    @IsString()
    @IsOptional()
    FlightNumber?: string;

    @IsNumber()
    @IsOptional()
    WayType?: number;

    @IsString()
    @IsOptional()
    Code?: string;

    @IsString()
    @IsOptional()
    Description?: string;

    @IsNumber()
    @IsOptional()
    Weight?: number;

    @IsString()
    @IsOptional()
    Currency?: string;

    @IsNumber()
    @IsOptional()
    Price?: number;

    @IsString()
    @IsOptional()
    Origin?: string;

    @IsString()
    @IsOptional()
    Destination?: string;
}

export class MealDynamicDto {
    @IsString()
    @IsOptional()
    AirlineCode?: string;

    @IsString()
    @IsOptional()
    FlightNumber?: string;

    @IsNumber()
    @IsOptional()
    WayType?: number;

    @IsString()
    @IsOptional()
    Code?: string;

    @IsString()
    @IsOptional()
    Description?: string;

    @IsString()
    @IsOptional()
    AirlineDescription?: string;

    @IsNumber()
    @IsOptional()
    Quantity?: number;

    @IsString()
    @IsOptional()
    Currency?: string;

    @IsNumber()
    @IsOptional()
    Price?: number;

    @IsString()
    @IsOptional()
    Origin?: string;

    @IsString()
    @IsOptional()
    Destination?: string;
}

export class SeatDynamicDto {
    @IsString()
    @IsOptional()
    AirlineCode?: string;

    @IsString()
    @IsOptional()
    FlightNumber?: string;

    @IsString()
    @IsOptional()
    CraftType?: string;

    @IsString()
    @IsOptional()
    Origin?: string;

    @IsString()
    @IsOptional()
    Destination?: string;

    @IsNumber()
    @IsOptional()
    AvailablityType?: number;

    @IsString()
    @IsOptional()
    Description?: string;

    @IsString()
    @IsOptional()
    Code?: string;

    @IsString()
    @IsOptional()
    RowNo?: string;

    @IsString()
    @IsOptional()
    SeatNo?: string;

    @IsNumber()
    @IsOptional()
    SeatType?: number;

    @IsNumber()
    @IsOptional()
    SeatWayType?: number;

    @IsNumber()
    @IsOptional()
    Compartment?: number;

    @IsNumber()
    @IsOptional()
    Deck?: number;

    @IsString()
    @IsOptional()
    Currency?: string;

    @IsNumber()
    @IsOptional()
    Price?: number;
}