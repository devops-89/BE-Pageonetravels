import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddFooterDto{
    footer_image:string

    @IsString()
    @IsNotEmpty()
    our_services:string

    @IsString()
    @IsNotEmpty()
    company:string

    @IsString()
    @IsNotEmpty()
    support:string

    @IsString()
    @IsNotEmpty()
    destinations:string

    @IsString()
    @IsNotEmpty()
    contact_address:string

    @IsString()
    @IsNotEmpty()
    contact_number:string

    @IsString()
    @IsNotEmpty()
    contact_email:string

    @IsString()
    @IsNotEmpty()
    copy_right:string
}



export class UpdateFooterDto{

    @IsString()
    @IsNotEmpty()
    footer_id:string


    @IsString()
    @IsOptional()
    footer_image:string

    @IsString()
    @IsOptional()
    our_services:string

    @IsString()
    @IsOptional()
    company:string  

    @IsString()
    @IsOptional()
    support:string

    @IsString()
    @IsOptional()
    destinations:string

    @IsString()
    @IsOptional()
    contact_address:string

    @IsString()
    @IsOptional()
    contact_number:string

    @IsString()
    @IsOptional()
    contact_email:string

    @IsString()
    @IsOptional()
    copy_right:string
}

