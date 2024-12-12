import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional, MinLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Reference ID is required' })
  referenceId: number;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
