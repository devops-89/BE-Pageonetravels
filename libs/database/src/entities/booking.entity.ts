import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('booking')
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string

  @Column({ type: "uuid" })
  userId: string;   

  @ManyToOne(() => User, (user) => user.booking, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;   

    @Column({ nullable: true })
    flight_details: string

    @Column({ nullable: true })
    passenger_details: string

    @Column({ nullable: true })
    booking_status: string

    @Column({ nullable: true })
    booking_date: string

    @Column({ nullable: true })
    booking_type: string

    @Column({ nullable: true })
    bookingpayment_status: string

    @Column({ nullable: true })
    bookingpayment_amount: string

    @Column({ nullable: true })
    bookingpaymentcurrency: string

    @Column({ nullable: true })
    bookingpayment_date: string

    @Column({ type: 'timestamp', default: () => 'now()' })
    created_at: Date

    @Column({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date

 

}