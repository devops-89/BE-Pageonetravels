import { IsString, IsEmail, IsIn, IsNumber, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';
import { DEFAULT_USER_ROLES, USER_TYPE } from '../../constants/autenticationConstants/userContants';

export class GetUserListDto {
  @IsOptional()
  @IsString()
  @IsIn(Object.values(DEFAULT_USER_ROLES))
  user_role: string;

  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number greater than or equal to 1' })
  page: number;

  @IsOptional()
  @IsNumber({}, { message: 'Page size must be a number between 1 and 200' })
  pageSize: number;

  @IsOptional()
  @IsString()
  @IsIn(Object.values(USER_TYPE))
  user_type: string;

  @IsOptional()
  sortBy: any;

  @IsOptional()
  @IsString()
  search: string;
}


export class AdminLoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

   @IsEnum(USER_TYPE)
   @IsOptional()
   user_type: USER_TYPE;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class AddMemberDto {
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
  
    // @IsString()
    // @IsNotEmpty({ message: 'Password is required' })
    // password: string;

    @IsString()
    @IsIn(Object.values(USER_TYPE))
    user_type: string;

    @IsString()
    phone_number: string;
  
    @IsString()
    reference_id: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    designation: string;

  }

  export class AdminChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Old password is required' })
    old_password: string;
  
    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    new_password: string;
  
    @IsEmail()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
  }