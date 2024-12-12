import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, isString } from "class-validator";

export class InsertAddressDto {
    @IsString()
    // @IsNotEmpty({ message: 'Street is required' })
    street: string;
  
    @IsString()
    // @IsNotEmpty({ message: 'House No is required' })
    houseNo: string;

    @IsString()
    // @IsNotEmpty({ message: 'City is required' })
    city: string;

    @IsString()
    // @IsNotEmpty({ message: 'City is required' })
    state: string;

    @IsString()
    // @IsNotEmpty({ message: 'Country is required' })
    country: string;


    @IsString()
    // @IsNotEmpty({ message: 'PostalCode is required' })
    postalCode: string;

    @IsBoolean()
    @IsOptional()
    isDefault:boolean

    @IsNumber()
    @IsOptional()
    addressId:Number

    @IsString()
    addressType: string
  }


  export class RemoveAddressDto {
    @IsNotEmpty({ message: 'id is required' })
    id: number;
  }


  export class EditAddressDto {

    @IsNumber()
    id: number

    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'Street is required' })
    street: string;
  
    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'House No is required' })
    houseNo: string;

    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'City is required' })
    city: string;

    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'Country is required' })
    country: string;


    @IsString()
    @IsOptional()
    // @IsNotEmpty({ message: 'PostalCode is required' })
    postalCode: string;

    @IsBoolean()
    @IsOptional()
    isDefault:boolean

    @IsString()
    @IsOptional()
    addressType: string
  }

  export class GetAddressByIdDto {
    @IsString()
    id: string;
  }