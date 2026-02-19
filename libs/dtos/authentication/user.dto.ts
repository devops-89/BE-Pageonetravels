import { IsString, IsEmail, IsNumber, Min, Max, Matches, IsOptional, IsNotEmpty, MinLength, IsEnum, isEmail, IsInt } from 'class-validator';
import { LOGIN_BY, USER_ACCOUNT_STATUS, USER_TYPE } from '../../constants/autenticationConstants/userContants';
import { DEVICE_TYPE } from '../../constants/commonConstants';
import { Transform, Type } from 'class-transformer';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identity: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  country_code: string;
}





export class UserQueryDto {
  @IsOptional()
  @IsString()
  user_type?: USER_TYPE;

  @IsOptional()
  @IsInt()
  @Min(1)
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Invalid page - page must be a number' })
  @Min(1, { message: 'Invalid page - must be >= 1' })
  page?: number;
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Invalid limit - limit must be a number' })
  @Min(1, { message: 'Invalid limit - must be >= 1' })
  limit?: number;
}

export class UserFilterDto {
  @IsOptional()
  @IsEnum(USER_TYPE)
  user_type: USER_TYPE;

  @IsOptional()
  @IsString()
  search: string;

  @IsOptional()
  @IsEnum(USER_ACCOUNT_STATUS)
  status: USER_ACCOUNT_STATUS;
}

export class notificationData {

  @IsString()
  @IsOptional()
  fcmToken: string;

  @IsString()
  @IsOptional()
  device_type: DEVICE_TYPE

}


export class LoginOrRegisterDto {
  @IsString()
  identity: string;

  @IsOptional()
  @IsString()
  country_code?: string;

  @IsEnum(USER_TYPE)
  user_type: USER_TYPE
}


export class VerifyDto {
  @IsString()
  @MinLength(6, { message: 'OTP Has 6 Characters' })
  otp: string;

  @IsString()
  reference_id: string;


  @IsString()
  @IsOptional()
  device_type: DEVICE_TYPE
}

export class AddEmailDto {
  @IsEmail()
  email: string;
}


export class AddPhoneDto {
  @IsString()
  phone_number: string;

  @IsString()
  country_code: string;
}


export class VerifyPhoneNoDto {
  @IsNumber()
  reference_id: number;

  @IsString()
  @Matches(/^\d{6}$/)
  otp: string;
}



export class UpdatePersonalDetailDto {
    @IsOptional()
    @IsString()
    full_name?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    reference_id?: string;

    @IsOptional()
    @IsString()
    country_code?: string;

    // @IsOptional()
    // @IsString()
    // countryName?: string;

    @IsOptional()
    @IsString()
    zipCode?: string;

    @IsOptional()
    @IsString()
    designation?: string;

    @IsOptional()
    @Type(() => Number)   // 👈 ensures proper casting
    @IsNumber()
    user_id?: number;
}

// renewToken.dto.ts
export class RenewTokenDto {
  @IsNotEmpty()
  @IsString()
  access_token: string;

  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  old_password: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  new_password: string;

  // @IsString()
  // @IsNotEmpty()
  // readonly otp: string;

  // @IsString()
  // @IsNotEmpty()
  // reference_id: string;


  @IsString()
  @IsOptional()
  device_type: DEVICE_TYPE

}

export class RegisterWithEmailPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^.{4,16}$/)
  password: string;

  @IsString()
  @Matches(/^.{2,50}$/)
  name: string;
}

export class RegisterDto {
  @IsEmail()
  @Transform(({ value }) => ("" + value).toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  // @IsNotEmpty()
  // @IsString()
  // user_role: string;

  @IsNotEmpty()
  @IsString()
  full_name: string;

  @IsEnum(USER_TYPE)
  @IsOptional()
  user_type: USER_TYPE;


  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsString()
  phone_number: string;

}


export class CustomLoginDto {

  @IsOptional()
  @IsString()
  // @Matches(/^.{2,50}$/)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  country_code: string;

  @IsOptional()
  @IsString()
  verify_by: LOGIN_BY
}
