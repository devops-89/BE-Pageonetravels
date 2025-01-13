import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddBannerDto{

    banner_image: String

    @IsString()
    @IsNotEmpty()
    banner_title: string

    @IsString()
    @IsNotEmpty()
    banner_heading: string

}

export class UpdateBannerDto{

    @IsString()
    @IsNotEmpty()
    banner_id: string

    @IsOptional()
    @IsString()
    banner_title: string

    @IsOptional()
    @IsString()
    banner_heading: string

}