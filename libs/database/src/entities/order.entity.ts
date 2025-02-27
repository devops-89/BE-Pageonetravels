import "reflect-metadata";
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ORDER_STATUS } from '../../../../libs/constants/bookingContant';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { float } from "aws-sdk/clients/cloudfront";

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn("uuid")
    order_id: string;

    @ManyToOne(() => User, (u) => u.orders)
    @JoinColumn({ name: "user_id" })
    user: User; 

    @IsString()
    order_type:string;

    @IsBoolean()
    is_domestic:string;

    @IsString()
    @IsOptional()
    @Column({ type: 'text', nullable: true })
    trace_id?: string;

    @Column({type:'text',nullable:true})
    order_request: string;


    @Column({type:'text',nullable:true})
    order_details: string;

    @Column({type:'text',nullable:true})
    passenger_details: string;

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

}