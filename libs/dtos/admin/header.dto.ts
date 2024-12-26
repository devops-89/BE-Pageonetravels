import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddHeaderDto{
    @IsString()
    @IsNotEmpty()
    favicon: String

    @IsString()
    @IsNotEmpty()
    header_logo: String

    @IsString()
    @IsNotEmpty()
    header_links: String 

}