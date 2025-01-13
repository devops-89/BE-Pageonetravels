import { IsString, IsNumber, IsBoolean, IsOptional, IsDateString, ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

// class PassengerFareDto {
//     @IsString()
//     currency: string;

//     @IsNumber()
//     base_fare: number;

//     @IsNumber()
//     tax: number;

//     @IsNumber()
//     yq_tax: number;

//     @IsNumber()
//     additional_txn_fee_pub: number;

//     @IsNumber()
//     additional_txn_fee_ofrd: number;

//     @IsNumber()
//     other_charges: number;

//     @IsNumber()
//     discount: number;

//     @IsNumber()
//     published_fare: number;

//     @IsNumber()
//     offered_fare: number;

//     @IsNumber()
//     tds_on_commission: number;

//     @IsNumber()
//     tds_on_plb: number;

//     @IsNumber()
//     tds_on_incentive: number;

//     @IsNumber()
//     service_fee: number;
// }

export class PassengerDto {
    @IsString()
    title: string;

    @IsString()
    first_name: string;

    @IsString()
    last_name: string;

    @IsNumber()
    pax_type: number;

    @IsDateString()
    date_of_birth: string;

    @IsString()
    gender: string;

    @IsString()
    passport_no: string;

    @IsDateString()
    passport_expiry: string;

    @IsString()
    contact_no: string;

    @IsString()
    email: string;

    @IsBoolean()
    is_lead_pax: boolean;

    @IsOptional()
    @IsString()
    ff_airline_code: string | null;

    @IsOptional()
    @IsString()
    ff_number: string;
}

export class BookingDto {
    @IsString()
    result_index: string;

    @IsString()
    ip_address: string;

    @IsString()
    @IsNotEmpty()
    is_LCC: boolean;

    @IsString()
    cell_country_code: string;

    @IsString()
    country_code: string;

    @IsString()
    city: string;

    @IsString()
    contact_no: string;

    @IsString()
    country: string

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

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PassengerDto)
    passenger_details: PassengerDto[];


    @IsString()
    trace_id: string;


    @IsOptional()
    @IsString()
    gst_company_address: string;

    @IsOptional()
    @IsString()
    gst_company_contact_number: string;

    @IsOptional()
    @IsString()
    gst_company_name: string;

    @IsOptional()
    @IsString()
    gst_number: string;

    @IsOptional()
    @IsString()
    gst_company_email: string;

    @IsNumber()
    base_fare: number;

    @IsNumber()
    tax: number;
}