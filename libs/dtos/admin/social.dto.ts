import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddSocialDto{

    icon_image:string

    @IsString()
    @IsNotEmpty()
    icon_link:string

    @IsString()
    @IsNotEmpty()
    icon_status:string
}

export class UpdateSocialDto{ 
    @IsString()
    @IsNotEmpty()
    social_id : string 

    @IsString()
    @IsOptional()
    icon_image:string 

    @IsString()
    @IsOptional()
    icon_link:string 

    @IsString()
    @IsOptional()
    icon_status:string 
}


