import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddOfferDto{
    
    @IsString()
    @IsNotEmpty()
    offer_title : string

    @IsString()
    @IsNotEmpty()
    offer_description: string

    @IsString()
    @IsNotEmpty()
    offer_listing: string

    @IsString()
    @IsNotEmpty()
    button_name: string

}

export class UpdateOfferDto{

    @IsString()
    @IsNotEmpty()
    offer_id: string

    @IsString()
    offer_title : string

    @IsString()
    offer_description: string

    @IsString()
    offer_listing: string

    @IsString()
    button_name: string 
} 