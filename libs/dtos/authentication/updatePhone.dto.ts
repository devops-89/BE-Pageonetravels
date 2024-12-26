import { IsNumber, IsOptional, IsString } from "class-validator";

export class AdminVerifyPhoneDto
    {
        @IsNumber()
        user_id: number

        @IsString()
        @IsOptional()
        phone_number:string
        
        @IsString()
        @IsOptional()
        reference_id:string
    }