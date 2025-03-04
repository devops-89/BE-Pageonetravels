import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany, JoinColumn, OneToOne } from "typeorm";
import "reflect-metadata";
import { OtpVerification } from "./otpVerification.entity";
import { Address } from "./address.entity";
import { LoginSession } from "./loginSession.entity";
import { IsDefined } from "class-validator";
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from "../../../constants/autenticationConstants/userContants";
import { Passenger } from "./passenger.entity";
import { Booking } from "./booking.entity";
import { Order } from "./order.entity";
import { TransactionDetail } from "./transaction.entity";
import { Payment } from "./payment.entity";

@Entity('user')
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;  

  @Column({ nullable: true })
  @IsDefined()
  full_name: string

  @Column({nullable : true})
  @IsDefined()
  avatar:string

  @Column({ nullable: true })
  @IsDefined()
  @Index()
  email: string

  @Column({ nullable: true })
  gst_number: string

  @Column({ nullable: true })
  gst_registered_company_name: string

  @Column({ nullable: true })
  gst_registered_address: string

  @Column({ nullable: true })
  gst_registered_email: string

  @Column({ nullable: true })
  gst_registered_mobile_number: string

  @Column({ nullable: true })
  @IsDefined()
  password: string

  @Column({ nullable: true })
  @IsDefined()
  reference_id: string

  
  @Column({nullable: true})
  is_cancel: boolean

  @Column({ nullable: true })
  is_refundable: boolean

  @Column({ nullable: true })
  is_LCC: boolean


  @Column({ nullable: true })
  @IsDefined()
  @Index()
  phone_number: string

  @Column({nullable: true})
  @IsDefined()
  country_code: string

  @Column({ default: false })
  is_phone_verified: boolean

  @Column({ default: false })
  is_email_verified: boolean

  @Column({
    type:'enum',
    enum:USER_ACCOUNT_STATUS, 
  })
  status: USER_ACCOUNT_STATUS;

  @Column({
    type:'enum',
    enum: USER_VERIFY_STATUS,
  })
  verify_status: USER_VERIFY_STATUS;

  
  @Column({
    type: 'enum',
    enum: USER_TYPE,
  })
  user_type: USER_TYPE;

  @OneToMany(() => OtpVerification, (o) => o.user)
  otp_verifications: OtpVerification[]

  // @OneToMany(() => Address, address => address.user, { cascade: true, nullable: true })
  // @JoinColumn({ name: 'address_id' })
  // addresses: Address[]

  @OneToMany(() => Address, (address) => address.user)
  addresses: Address[];
  

  @OneToMany(() => TransactionDetail, transaction => transaction.user, { cascade: true, nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionDetail[]


  @OneToMany(() => Booking, booking => booking.user, { cascade: true, nullable: true })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking[]

  @OneToMany(() => Order, (order)=>order.user, {cascade: true})
  orders:Order[]


  @OneToMany(() => Payment, (payment)=>payment.payment_id, {cascade: true})
  payment:Payment[]

  @OneToOne(() => Passenger, p => p.id, { cascade: true, nullable: true })
  @JoinColumn({ name: 'passenger_id' })
  passenger: Passenger 

  
  @OneToMany(() => LoginSession, session => session.user)
  login_sessions: LoginSession[];

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date

}
