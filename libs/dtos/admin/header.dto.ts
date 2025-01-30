import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID, IsMimeType, IsMultibyte } from 'class-validator';

export class AddHeaderDto{
    // @IsMimeType()
    // @IsNotEmpty()
    // favicon: String

    // @IsMultibyte()
    // @IsNotEmpty()
    // header_logo: String

    @IsString()
    @IsNotEmpty()
    header_links: string 

}

export class UpdateHeaderDto{

    @IsString()
    @IsNotEmpty()
    header_id: string

    
    @IsString()
    @IsOptional()
    header_links?: string

}