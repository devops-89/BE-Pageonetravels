import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AddBrandDto {

   @IsString()
    @IsNotEmpty()
    brand_name: string;

    @IsOptional()
    brand_logo?: Buffer;

    @IsString()
    @IsOptional()
    description?: string;
}


export class UpdateBrandDto {
    @IsString()
    @IsOptional()
    brand_name?: string;

    @IsString()
    @IsOptional()
    brand_logo?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class File {
    originalname: string
    buffer: Buffer
    mimetype: string
    size: number
}
