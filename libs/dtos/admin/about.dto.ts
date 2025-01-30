import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddAboutDto{
    @IsString()
    @IsNotEmpty()
    about_heading:string

    @IsString()
    @IsNotEmpty()
    about_description:string

    @IsString()
    @IsNotEmpty()
    about_button:string
}

export class UpdateAboutDto{
    @IsString()
    @IsNotEmpty()
    about_id: string

    @IsString()
    @IsOptional()
    about_heading:string

    @IsString()
    @IsOptional()
    about_description:string

    @IsString()
    @IsOptional()
    about_button:string
}