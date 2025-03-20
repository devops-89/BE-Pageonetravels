import "reflect-metadata";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Order } from "./order.entity";
import { OrderId } from "aws-sdk/clients/outposts";
import { User } from "./user.entity";
import { IsOptional, IsString } from "class-validator";
import { PAYMENT_STATUS } from "../../../../libs/constants/bookingContant";


@Entity('payment')
export class Payment {
    @PrimaryGeneratedColumn("uuid")
    payment_id: string;  


    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: 'order_id' })
    order: Order;

    @ManyToOne(() => User, (user) => user.payments)
    @JoinColumn({ name: "user_id" })
    user: User;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    transaction_id?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    payment_mode?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    payment_status?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    razorpay_order_id?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    razorpay_receipt?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    amount?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    currency?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    payment_gateway?: string;


    @Column({type:'text',nullable:true})
    razorpay_link_response:string;
     
    @Column({type:'text',nullable:true})
    razorpay_webhook_response:string;


    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    paid_at?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    refund_status?: string;

    @IsString()
    @IsOptional()
    @Column({ type: 'varchar', nullable: true })
    payment_notes?: string;

    @Column({
            type:'enum',
            enum:PAYMENT_STATUS, 
        })
    status: PAYMENT_STATUS;
    

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
    
}