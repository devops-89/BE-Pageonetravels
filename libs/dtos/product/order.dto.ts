import { IsEnum, IsNotEmpty, IsNumber, IsString, IsDecimal, IsOptional, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { InsertAddressDto } from '../authentication/address.dto';
import { Type } from 'class-transformer';
import { ORDER_STATUS } from 'libs/constants/orderConstants';

export class CreateOrderDto {

    @IsNumber()
    @IsNotEmpty({ message: 'Total amount is required' })
    total_amount: number;

    @IsNumber()
    @IsOptional()
    shipping_cost: number;

    @IsString()
    @IsOptional()
    currency: string;

    @IsNumber()
    @IsOptional()
    total_discount: number;

    @IsNumber()
    @IsOptional()
    tax_amount: number;
    
    @IsNumber()
    @IsOptional()
    base_amount: number;

    @IsNumber()
    @IsOptional()
    shippingAddressId: number;

    @IsNumber()
    @IsOptional()
    billingAddressId: number;

    @IsArray()
    @IsNumber({}, { each: true, message: 'Each cartId must be a number' })
    cartIds: number[];
  
    @ValidateNested()
    @Type(() => InsertAddressDto)
    @IsOptional()
    shipping_address: InsertAddressDto;

    
    @ValidateNested()
    @Type(() => InsertAddressDto)
    @IsOptional()
    billing_address: InsertAddressDto;
}


export class UpdateOrderDto {
    @IsNumber()
    @IsNotEmpty({ message: 'Order ID is required' })
    orderId: number;

    @IsDecimal()
    @IsOptional()
    total_amount?: number;

    @IsEnum(['Pending', 'Shipped', 'Delivered', 'Cancelled', 'Returned'], { message: 'Invalid order status' })
    @IsOptional()
    order_status?: string;

    @IsString()
    @IsOptional()
    shipping_address?: string;

    @IsString()
    @IsOptional()
    billing_address?: string;
}

export class GetOrderByIdDto {
    @IsNumber()
    @IsNotEmpty({ message: 'Order ID is required' })
    orderId: number;

    @IsString()
    @IsOptional()
    status: string;

}

export class DeleteOrderDto {
    @IsNumber()
    @IsNotEmpty({ message: 'Order ID is required' })
    orderId: number;
}

export class FilterOrdersDto {
    @IsOptional()
    @IsDateString()
    fromDate?: string;

    @IsOptional()
    @IsDateString()
    toDate?: string;

    @IsOptional()
    @IsEnum(ORDER_STATUS)
    status?: ORDER_STATUS;
}
