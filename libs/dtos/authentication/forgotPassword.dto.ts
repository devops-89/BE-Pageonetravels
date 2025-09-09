import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, MinLength, IsEnum } from 'class-validator';
import {Transform} from "class-transformer";
import { USER_TYPE } from 'libs/constants/autenticationConstants/userContants';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class SignupLoginDTO{
  @IsEmail({},  {message: 'Invalid email format'} )
  email: string;
  
  @IsOptional() 
  @IsEnum(USER_TYPE)
  user_type: USER_TYPE; 

}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;

  @IsString()
  @IsNotEmpty({ message: 'Reference ID is required' })
  reference_id: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @Transform(({ value }) => value?.trim())
  password: string;
}
