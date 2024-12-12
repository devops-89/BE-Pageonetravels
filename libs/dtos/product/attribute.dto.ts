import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class AddAttributeDto {

   @IsString()
    @IsNotEmpty()
    type: string;

    @IsOptional()
    @IsArray()
    value: string[];

}