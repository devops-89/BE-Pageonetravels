import "reflect-metadata";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ORDER_STATUS } from '../../../../libs/constants/bookingContant';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToMany, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { float } from "aws-sdk/clients/cloudfront";
import { Payment } from "./payment.entity";
import { ORDER_TYPE } from "../../../../libs/constants/orderConstant";

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn("uuid")
    order_id: string;

    @Column({ nullable: true })
    custom_order_id: string;


    @ManyToOne(() => User, (u) => u.orders)
    @JoinColumn({ name: "user_id" })
    user: User; 

    @Column({ nullable: true })
    commission_type: string;

    @Column()
    @IsString()
    commission: string;

    @Column({
        type: 'enum',
        enum: ORDER_TYPE,
        nullable: true,
    })
    order_type: ORDER_TYPE;
    

    @Column()
    @IsString()
    journey_type: string;


    @Column()
    @IsString()
    journey: string;

    @Column({ type: 'boolean', nullable: true }) // <- important!
    @IsBoolean()
    @IsOptional()
    isLCC?: boolean;

    @Column({ type: 'boolean', nullable: true })
    @IsBoolean()
    @IsOptional()
    is_LCC_round: boolean; 

    @IsString()
    @IsOptional()
    @Column({ type: 'text', nullable: true })
    trace_id?: string;

    @Column({type:'text',nullable:true})
    order_request: string;

    @Column({type:'text',nullable:true})
    order_response: string;

    @Column({type:'text',nullable:true})
    order_request_second: string;

    @Column({type:'text',nullable:true})
    order_response_second: string;

    @Column({type:'text',nullable:true})
    order_details: string;

    @Column({type:'text',nullable:true})
    success_response: string;

    @Column({type:'text',nullable:true})
    fail_response: string;

    @Column({type:'text',nullable:true})
    flight_round_success: string;

    @Column({type:'text',nullable:true})
    flight_round_fail: string;

    @Column({type:'text',nullable:true})
    payment_response: string;

    @Column({type:'text',nullable:true})
    ticket_details: string;

    @Column({type:'text',nullable:true})
    contact_details: string;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: string;
    
    @Column({
        type:'enum',
        enum:ORDER_STATUS, 
    })
    status: ORDER_STATUS;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Add OneToOne relation to Payment entity
    @OneToOne(() => Payment, (payment) => payment.order)
    payment: Payment;
 

}


