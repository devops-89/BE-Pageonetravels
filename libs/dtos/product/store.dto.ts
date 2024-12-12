import { IsNotEmpty, IsObject, IsOptional, IsString, isString } from "class-validator"
import { InsertAddressDto } from "../authentication/address.dto";
import { Address } from "../../database/src/entities/address.entity"
import { Transform } from "class-transformer";

export class addStoreDto {
    
    @IsString()
    @IsNotEmpty()
    store_name: string

    @IsOptional()
    store_logo?: Buffer;

    @IsString()
    @IsOptional()
    description: string;

    @IsObject()
    @Transform(({ value }) => {
        try {
            return JSON.parse(value);
        } catch (error) {
            return value;
        }
    })
    address:InsertAddressDto

}

export class UpdateStoreDto {
    @IsOptional()  
    @IsString()
    store_name: string;

    @IsString()
    @IsOptional()
    description: string;

    @IsOptional()
    address: Address;

}