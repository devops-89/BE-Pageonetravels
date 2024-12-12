import { ORDER_STATUS, PAYMENT_STATUS } from "../../../libs/constants/orderConstants";
import { ProductVariant } from "../../database/src";

export declare namespace OrderI {
  export interface IOrder {
    orderId: string;
    userId: number;
    cartId: number;
    totalAmount: number;
    orderStatus: ORDER_STATUS;
    paymentStatus: PAYMENT_STATUS;
    items: ProductVariant
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    createdAt: Date;
    updatedAt: Date;
  }


  interface InsertOrder {
    userId: number,
    order_status: ORDER_STATUS,
    total_amount: number,
    shipping_cost: number,
    tax_amount: number,
    base_amount: number,
    total_discount: number,
    billing_address: number,
    order_date: Date,
    shipping_address: number,
    homeDelivery: string,
  }
}

export interface IOrderItem {
  quantity: number,
  price: number,
  tax: number,
  totalAmount: number,
  discount: number,
  orderId: number,
  variantId: number
}
