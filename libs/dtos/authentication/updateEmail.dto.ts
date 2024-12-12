import { IsEmail, IsNumber, IsOptional } from "class-validator";

export class AdminVerifyEmailDto 
{
    @IsNumber()
    userId: number

    @IsEmail()
    @IsOptional()
    email: string
}