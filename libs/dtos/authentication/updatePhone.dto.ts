import { IsNumber, IsOptional, IsString } from "class-validator";

export class AdminVerifyPhoneDto
    {
        @IsNumber()
        userId: number

        @IsString()
        @IsOptional()
        phone_no:string
        
        @IsString()
        @IsOptional()
        reference_id:string
    }