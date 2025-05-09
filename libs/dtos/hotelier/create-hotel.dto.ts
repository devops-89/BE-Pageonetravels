import {
    IsString,
    IsEmail,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsArray,
    IsDecimal,
    IsInt,
    Matches,
    IsUUID,
    // IsTimeString,
  } from 'class-validator';
  
  export class CreateHotelDto {
    @IsString()
    name: string;
  
    @IsString()
    description: string;
  
    @IsString()
    type: string;
  
    @IsInt()
    star_rating: number;
  
    @IsString()
    address_line: string;
  
    @IsString()
    city: string;
  
    @IsString()
    state: string;
  
    @IsString()
    country: string;
  
    @IsString()
    postal_code: string;
  
    @IsOptional()
    @IsNumber()
    latitude?: number;
  
    @IsOptional()
    @IsNumber()
    longitude?: number;
  
    @IsString()
    contact_name: string;
  
    @IsEmail()
    contact_email: string;
  
    @IsString()
    contact_phone: string;
  
    @IsOptional()
    @IsString()
    alternate_phone?: string;
  
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_in_time must be in the format HH:mm:ss',
    })
    check_in_time: string;
    
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'check_out_time must be in the format HH:mm:ss',
    })
    check_out_time: string;
  
    @IsString()
    cancellation_policy: string;
  
    @IsOptional()
    @IsString()
    child_policy?: string;
  
    @IsOptional()
    @IsString()
    pet_policy?: string;
  
    @IsString()
    main_image: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    gallery_images?: string[];
  
    @IsNumber()
    base_price: number;
  
    @IsNumber()
    tax_percentage: number;
  
    @IsString()
    currency: string;
  
    @IsBoolean()
    wifi: boolean;
  
    @IsBoolean()
    parking: boolean;
  
    @IsBoolean()
    ac: boolean;
  
    @IsBoolean()
    restaurant: boolean;
  
    @IsBoolean()
    pool: boolean;
  
    @IsBoolean()
    gym: boolean;
  
    @IsBoolean()
    spa: boolean;
  
    @IsBoolean()
    bar: boolean;
  
    @IsBoolean()
    laundry: boolean;

    @IsUUID()
    user_id: string;
  }


