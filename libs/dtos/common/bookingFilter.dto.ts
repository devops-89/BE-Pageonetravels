import { IsOptional, IsString } from 'class-validator';

export class BookingFilterDto {
    search?: string;
    userId?: string;
    orderId?: string;
    customOrderId?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    country?: string;   
    city?: string;
    state?: string;
    zipCode?: string;
    orderDate?: string;
    orderTime?: string;
    orderStatus?: string;
    orderType?: string;
    orderAmount?: string;
    journey?: string;     
    paymentStatus?: string;
    status?: string;
    paymentMethod?: string;
    paymentId?: string;
    paymentAmount?: string;
    paymentCurrency?: string;
  } 
