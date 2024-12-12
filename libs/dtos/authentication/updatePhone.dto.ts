import { IsNumber, IsOptional, IsString } from "class-validator";

export class AdminVerifyPhoneDto
    {
        @IsNumber()
        userId: number

        @IsString()
        @IsOptional()
        phoneNo:string
        
        @IsString()
        @IsOptional()
        countryCode:string
    }