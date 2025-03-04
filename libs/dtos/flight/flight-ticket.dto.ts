import {
    IsString,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsDateString,
    ValidateNested,
    IsArray,
    IsIn,
    IsNotEmpty,
    ArrayMinSize,
    MinLength,
    IsInt
} from 'class-validator';
import { Type } from 'class-transformer';




export class LccTicketDto { 
    @IsString()
    @IsNotEmpty()
    currency: string;

    @IsString()
    @IsNotEmpty()
    amount: string;

    @IsString()
    @IsNotEmpty()
    receipt: string;
}

export class VerifyDto{
    @IsString()
    @IsNotEmpty()
    razorpay_payment_id: string;

    @IsString()
    @IsNotEmpty()
    razorpay_order_id: string;

    @IsString()
    @IsNotEmpty()
    razorpay_signature: string;

}