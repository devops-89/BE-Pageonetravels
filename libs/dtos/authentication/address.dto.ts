import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, isString } from "class-validator";

export class InsertAddressDto {
    @IsString()
    // @IsNotEmpty({ message: 'Street is required' })
    street: string;
  
    @IsString()
    // @IsNotEmpty({ message: 'House No is required' })
    house_number: string;

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
    postal_code: string;

    @IsBoolean()
    @IsOptional()
    isdefault:boolean

    @IsString()
    @IsOptional()
    address_id:string

    // @IsString()
    // address_type: string
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
    house_number: string;

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
    postal_code: string;

    @IsBoolean()
    @IsOptional()
    isdefault:boolean

    // @IsString()
    // @IsOptional()
    // address_type: string
  }

  export class GetAddressByIdDto {
    @IsString()
    id: string;
  }