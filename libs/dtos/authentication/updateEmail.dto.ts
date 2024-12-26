import { IsEmail, IsNumber, IsOptional } from "class-validator";

export class AdminVerifyEmailDto 
{
    @IsNumber()
    user_id: number

    @IsEmail()
    @IsOptional()
    email: string
}