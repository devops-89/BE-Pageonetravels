import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Booking } from "./booking.entity";

@Entity('transaction')
export class TransactionDetail {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ nullable: true })
    transaction_details: string

    @Column({ nullable: true })
    transaction_status: string

    @Column({ nullable: true })
    transaction_date: string

    @Column({ nullable: true })
    transaction_type: string

    @Column({ nullable: true })
    transaction_payment_status: string

    @Column({ nullable: true })
    transaction_payment_amount: string

    @Column({ nullable: true })
    transaction_payment_currency: string

    @Column({ nullable: true })
    transaction_payment_date: string

    @Column({ type: 'timestamp', default: () => 'now()' })
    created_at: Date

    @Column({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date

    @OneToMany(() => User, u => u.id)
    @JoinColumn({ name: "user_id" })
    user: User

}