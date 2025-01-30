import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddFestivalDto{
    @IsString()
    @IsNotEmpty()
    festival_name:string

    @IsString()
    @IsNotEmpty()
    festival_discount: string

    @IsString()
    @IsNotEmpty()
    festival_status: string
}

export class UpdateFestivalDto{ 

    @IsString()
    @IsOptional()
    festival_id: string

    @IsString()
    @IsOptional()
    festival_name:string

    @IsOptional()
    festival_discount: string

    @IsOptional()
    festival_status: string
}