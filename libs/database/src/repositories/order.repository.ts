import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities';
import { ORDER_STATUS, PAYMENT_STATUS } from '../../../../libs/constants/bookingContant';
import { ORDER_TYPE } from '../../../../libs/constants/orderConstant';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { PaginationDto } from '../../../../libs/dtos/authentication/user.dto';
import { BookingFilterDto } from '../../../../libs/dtos/common/bookingFilter.dto';
import { IPaginationObject } from '../../../../libs/interfaces/commonTypes/custom.interface';

@Injectable()
export class OrderRepositoryService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>
    ) {}

    createQueryBuilder(alias: string) {
        return this.orderRepository.createQueryBuilder(alias);
    }

    save(order: Order) {
        return this.orderRepository.save(order);
    }

    async insertBooking(reference_id, order_type, payload, amount, is_LCC?, journey?, journey_type?, commtype?, commpercentage?, extraInfo?): Promise<Order | null> {
        try {
            if (order_type === ORDER_TYPE.FLIGHT) {
                console.log(payload);
                // Create order instance
                var orderId = `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 999)}-${Math.floor(1000 + Math.random() * 9000)}`;

                const newOrder = this.orderRepository.create({
                    custom_order_id: orderId,
                    commission_type: commtype,
                    commission: commpercentage,
                    order_type: order_type,
                    journey_type: journey_type,
                    journey: journey,
                    isLCC: is_LCC,
                    trace_id: payload.TraceId,
                    order_request: payload,
                  order_request_second: extraInfo,
                    user: { id: reference_id },
                    amount: amount,
                    status: ORDER_STATUS.INIT,
                });

                // Save the order to the database and get the inserted ID
                const savedOrder = await this.orderRepository.save(newOrder);

                // Fetch the saved order with its relations (e.g., related user)
                let order = await this.orderRepository.findOne({
                    where: { custom_order_id: savedOrder.custom_order_id },
                    select: ['custom_order_id', 'amount'], // Select only relevant fields
                });

                return order;
            } else if (order_type == ORDER_TYPE.HOTEL) {
                var orderId = `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 999)}-${Math.floor(1000 + Math.random() * 9000)}`;
                const newOrder = this.orderRepository.create({
                    custom_order_id: orderId,
                    // commission_type: commtype,
                    // commission: commpercentage,
                    order_type: order_type,
                    order_request: payload,
                    user: { id: reference_id },
                    amount: amount,
                    order_request_second: extraInfo,
                    status: ORDER_STATUS.INIT,
                });
                console.log('>>>>>>>>>>>>kkk', newOrder);
                // Save the order to the database and get the inserted ID
                const savedOrder = await this.orderRepository.save(newOrder);

                // Fetch the saved order with its relations (e.g., related user)
                let order = await this.orderRepository.findOne({
                    where: { custom_order_id: savedOrder.custom_order_id },
                    select: ['custom_order_id', 'amount'], // Select only relevant fields
                });

                return order;
            }
        } catch (error) {
            console.log('save Booking API Database into database...error', error);
            throw error;
        }
    }

    // insert- Booking for round trip flight
    async roundinsertBooking(reference_id, order_type, payload, amount, is_LCC, journey, journey_type, commtype, commpercentage, payloadSecond, secondType): Promise<Order | null> {
        try {
            if (order_type === ORDER_TYPE.FLIGHT) {
                console.log('Payload second:', payloadSecond);
                // Create order instance
                var orderId = `${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 999)}-${Math.floor(1000 + Math.random() * 9000)}`;

                const newOrder = this.orderRepository.create({
                    custom_order_id: orderId,
                    commission_type: commtype,
                    commission: commpercentage,
                    order_type: order_type,
                    journey_type: journey_type,
                    journey: journey,
                    isLCC: is_LCC,
                    is_LCC_round: secondType,
                    trace_id: payload.TraceId,
                    order_request: payload,
                    user: { id: reference_id }, // Correct way to assign a relation
                    amount: amount,
                    order_request_second: payloadSecond,
                    status: ORDER_STATUS.INIT,
                });

                // Save the order to the database and get the inserted ID
                const savedOrder = await this.orderRepository.save(newOrder);

                // Fetch the saved order with its relations (e.g., related user)
                let order = await this.orderRepository.findOne({
                    where: { custom_order_id: savedOrder.custom_order_id },
                    select: ['custom_order_id', 'amount'], // Select only relevant fields
                });

                return order;
            }
        } catch (error) {
            console.log('save Booking API Database into database...error', error);
            throw error;
        }
    }

    async findOne(receipt) {
        try {
            const data = await this.orderRepository.findOne({
                where: {
                    custom_order_id: receipt,
                },
                loadRelationIds: true,
            });

            if (!data) {
                throw { message: '', statusCode: ERROR_CODES.BAD_REQUEST };
            }

            return data;
        } catch (error) {
            console.log('>>>>>>>>>>>>>', error.message);
            throw error;
        }
    }

    // update order
    async updateOrder(orderId: string, body: any) {
        try {
            // Optionally, fetch the updated record and return
            const updatedOrder = await this.orderRepository.findOne({
                where: { custom_order_id: orderId },
                loadRelationIds: true,
            });

            // Check if the order exists
            if (!updatedOrder) {
                throw {
                    message: `Order with custom_order_id ${orderId} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            // Update the payment response
            updatedOrder.payment_response = body;
            updatedOrder.status = ORDER_STATUS.COMPLETED;

            // Save the updated order to the database
            await this.orderRepository.save(updatedOrder);

            console.log('Order updated:', updatedOrder.order_id);
            return updatedOrder.order_id;
        } catch (error) {
            console.log('>>>>>>>>>>>>>', error.message);
            throw error;
        }
    }

    // update payment
    async updatePaymentFail(order_id, flightresposne) {
        try {
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw {
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.fail_response = flightresposne;
            updatedOrder.status=ORDER_STATUS.FAILED;

            // Save the updated order to the database
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.fail_response;
        } catch (error) {
            console.log(error);
        }
    }

    async updatePaymentSuccess(order_id, flightresposne) {
        try {
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw {
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.success_response = flightresposne;
            updatedOrder.status=ORDER_STATUS.COMPLETED;

            // Save the updated order to the database
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.success_response;
        } catch (error) {
            console.log(error);
        }
    }

    // save success booking
    async updatePaymentBooking(order_id, flightresposne) {
        try {
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: order_id },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw {
                    message: `Order with order_id : ${order_id} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.order_response = flightresposne;

            // Save the updated order to the database
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.order_response;
        } catch (error) {
            console.log(error);
        }
    }

    async getUserBookingsWithFilters(userId: string, pagination: PaginationDto, filter: BookingFilterDto): Promise<IPaginationObject> {
        try {
            const { search, journey, orderType } = filter;
            const { page = 1, limit = 10 } = pagination;
            const queryBuilder = this.orderRepository.createQueryBuilder('o');
            queryBuilder
                .leftJoinAndSelect('o.user', 'u')
                .where('o.user_id = :userId', { userId })
                .orderBy('o.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            if (search) {
                queryBuilder.andWhere(
                    `(
              payment.payment_status = :paymentStatus OR
              u.full_name ILIKE :search OR
              u.email ILIKE :search OR
              CAST(o.order_type AS TEXT) ILIKE :search OR
              CAST(o.journey AS TEXT) ILIKE :search OR
              o.custom_order_id ILIKE :search
            )`,
                    { search: `%${search}%` }
                );
            }
            if (journey) {
                queryBuilder.andWhere(`CAST(o.journey AS TEXT) = :journey`, { journey });
            }
            if (orderType) {
                queryBuilder.andWhere(`CAST(o.order_type AS TEXT) = :orderType`, { orderType });
            }
            const [orders, count] = await queryBuilder.getManyAndCount();
            const paginateObject: IPaginationObject = {
                docs: orders,
                limit,
                totalDocs: count,
                totalPages: Math.ceil(count / limit),
                hasPrevPage: page > 1,
                hasNextPage: page * limit < count,
            };
            return paginateObject;
        } catch (error) {
            console.error('Error in getUserBookingsWithFilters:', error);
            throw error;
        }
    }

    // for updating the payment status success or failed
    async updatePaymentStatus(orderId: string, status: PAYMENT_STATUS): Promise<string> {
        try {
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: orderId },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw {
                    message: `Order with order_id : ${orderId} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.payment_status = status;

            await this.orderRepository.save(updatedOrder);

            return updatedOrder.payment_status;
        } catch (error) {
            console.error('Error updating payment status:', error);
            throw error;
        }
    }



    async findAll(userId?: string): Promise<Order[]> {
        try {
            const query = this.orderRepository.createQueryBuilder('order').leftJoinAndSelect('order.user', 'user');

            if (userId) {
                query.where('user.id = :userId', { userId });
            }

            return await query.getMany();
        } catch (error) {
            console.error('Error fetching all orders:', error);
            throw error;
        }
    }

async find(orderId?: string): Promise<Order> {
  try {
       const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: orderId },
                loadRelationIds: true,
            });



    return updatedOrder;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
}


    async updatePdfUrl(orderId: string, pdfUrl: string): Promise<string> {
        try {
            const updatedOrder = await this.orderRepository.findOne({
                where: { order_id: orderId },
                loadRelationIds: true,
            });

            if (!updatedOrder) {
                throw {
                    message: `Order with order_id: ${orderId} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.pdf_url = pdfUrl;
            await this.orderRepository.save(updatedOrder);

            return updatedOrder.pdf_url;
        } catch (error) {
            console.error(`Failed to update PDF URL for order ${orderId}:`, error);
            throw error;
        }
    }

    // change Order Status
    async updateOrderStatus(orderId:string,status:ORDER_STATUS,ChangeRequestId:number){
        try{
           const updatedOrder=await this.orderRepository.findOne({
            where:{order_id:orderId},
            loadRelationIds:true
           });

              if (!updatedOrder) {
                throw {
                    message: `Order with order_id: ${orderId} not found.`,
                    statusCode: ERROR_CODES.BAD_REQUEST,
                };
            }

            updatedOrder.status=status;
            updatedOrder.ChangeRequestId=ChangeRequestId;
            await this.orderRepository.save(updatedOrder);
            return updatedOrder;


        }
        catch(error){
            console.error(`Failed to update Order Status fror Order ${orderId}: `,error);
            throw error;
        }
    }

    // get all booking with booking type
    async getBookingsWithFilters(pagination: PaginationDto, filter: BookingFilterDto): Promise<IPaginationObject> {
  const { search, journey, orderType } = filter;
  const { page = 1, limit = 10 } = pagination;

  const queryBuilder = this.orderRepository.createQueryBuilder('o')
    .leftJoinAndSelect('o.user', 'u')
    .orderBy('o.created_at', 'DESC')
    .skip((page - 1) * limit)
    .take(limit);

  if (search) {
    queryBuilder.andWhere(
      `(
        u.full_name ILIKE :search OR
        u.email ILIKE :search OR
        CAST(o.order_type AS TEXT) ILIKE :search OR
        CAST(o.journey AS TEXT) ILIKE :search OR
        o.custom_order_id ILIKE :search
      )`,
      { search: `%${search}%` }
    );
  }

  if (journey) {
    queryBuilder.andWhere(`CAST(o.journey AS TEXT) = :journey`, { journey });
  }

  if (orderType) {
    queryBuilder.andWhere(`CAST(o.order_type AS TEXT) = :orderType`, { orderType });
  }

  const [orders, count] = await queryBuilder.getManyAndCount();

  return {
    docs: orders,
    limit,
    totalDocs: count,
    totalPages: Math.ceil(count / limit),
    hasPrevPage: page > 1,
    hasNextPage: page * limit < count,
  };
}

}
