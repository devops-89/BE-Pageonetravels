import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany, JoinColumn } from "typeorm";
import "reflect-metadata";
import { OTP_SEND_ON, OTP_TYPE, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_VERIFY_STATUS } from "../../../constants/autenticationConstants/userContants";
import { IsDefined } from "class-validator";
import { User } from "./user.entity";


@Entity('otpverification')
export class OtpVerification {

  @PrimaryGeneratedColumn("uuid")
  id: string;  

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

  @Column()
  otp: string

  @ManyToOne(() => User, (u) => u.otp_verifications)
  @JoinColumn({ name: "user" })
  @IsDefined()
  user: User
  
  
  @Column({
    type: 'enum',
    enum: OTP_TYPE,
  })
  otpType:OTP_TYPE

  @Column({
    type: 'enum',
    enum: OTP_SEND_ON,
  })
   sendOn: OTP_SEND_ON

   @Column()
  emailOrPhone: string

  @Column({nullable:true})
  @IsDefined()
  reference_id: string

  @Column({type:"bigint"})
  expiryTime: number

}

