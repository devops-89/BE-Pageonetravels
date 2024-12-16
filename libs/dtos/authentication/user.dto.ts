import { IsString, IsEmail, IsNumber, Min, Max, Matches, IsOptional, IsNotEmpty, MinLength, IsEnum, isEmail, IsInt } from 'class-validator';
import { LOGIN_BY, USER_ACCOUNT_STATUS, USER_TYPE } from '../../constants/autenticationConstants/userContants';
import { DEVICE_TYPE } from '../../constants/commonConstants';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identity: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  countryCode: string;
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
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}
export class UserFilterDto {
  @IsOptional()
  @IsEnum(USER_TYPE)
  user_type: USER_TYPE; // Make status optional

  @IsOptional()
  @IsString()
  search: string; // To search by name, email, or phone number

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
  deviceType: DEVICE_TYPE

}
// loginOrRegister.dto.ts
export class LoginOrRegisterDto {
  @IsString()
  identity: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsEnum(USER_TYPE)
  user_type: USER_TYPE
}



// verify.dto.ts
export class VerifyDto {
  @IsString()
  @MinLength(6, { message: 'OTP must be at least 6 characters long' })
  otp: string;

  @IsNumber()
  referenceId: number;

  
  @IsString()
  @IsOptional()
  deviceType: DEVICE_TYPE
}

// addEmail.dto.ts
export class AddEmailDto {
  @IsEmail()
  email: string;
}

// addPhone.dto.ts
export class AddPhoneDto {
  @IsString()
  phoneNo: string;

  @IsString()
  countryCode: string;
}

// verifyPhoneNo.dto.ts
export class VerifyPhoneNoDto {
  @IsNumber()
  referenceId: number;

  @IsString()
  @Matches(/^\d{6}$/)
  otp: string;
}

// updatePersonalDetail.dto.ts
export class UpdatePersonalDetailDto {
  @IsOptional()
  @IsString()
  name: string;

  // @IsOptional()
  // @IsString()
  // password: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phoneNo: string;

  @IsOptional()
  @IsString()
  countryCode: string;

  // @IsOptional()
  // @IsString()
  // countryName: string;

  @IsOptional()
  @IsString()
  zipCode: string;

  @IsOptional()
  @IsString()
  designation: string

  @IsOptional()
  @IsNumber()
  userId: number
}

// renewToken.dto.ts
export class RenewTokenDto {
  @IsNotEmpty()
  @IsString()
  accessToken: string;

  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

// changePassword.dto.ts
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Old password is required' })
  oldPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  readonly otp: string;

  @IsString()
  @IsNotEmpty()
  referenceId: number;
  
  
  @IsString()
  @IsOptional()
  deviceType: DEVICE_TYPE

}

// registerWithEmailPassword.dto.ts
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
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  // @IsNotEmpty()
  // @IsString()
  // userRole: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(USER_TYPE)
  @IsOptional()
  user_type: USER_TYPE;
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
  phoneNo: string;

  @IsOptional()
  @IsString()
  countryCode: string;

  @IsOptional()
  @IsString()
  verifyBy: LOGIN_BY
}
