// src/refund/dto/create-refund.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateRefundDto {
    @IsString()
    orderId: string;

    @IsOptional()
    @IsNumber()
    amount?: number; // in paise (e.g., 10000 = ₹100)

    @IsOptional()
    @IsString()
    speed?: 'normal' | 'instant';

    @IsOptional()
    @IsString()
    remarks?: string;
}
