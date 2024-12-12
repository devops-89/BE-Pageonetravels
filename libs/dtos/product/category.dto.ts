import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, isString } from "class-validator"
import { CATEGORY_TYPE } from "../../.../../../libs/constants/productConstant";
import { Transform, Type } from "class-transformer";

export class addCategoryDto {
    
    @IsString()
    @IsNotEmpty()
    category_name: string;

    @IsOptional()
    @Transform(({ value }) => Number(value), { toClassOnly: true }) // Convert string to number
    @IsNumber()
    parent_id?: number;


    @IsString()
    @IsOptional()
    type: CATEGORY_TYPE;

    @IsString()
    @IsOptional()
    description?: string;

}

export class UpdateCategoryDto {
    
    @IsString()
    @IsOptional()
    category_name: string;

    @IsString()
    @IsOptional()
    description?: string;
}