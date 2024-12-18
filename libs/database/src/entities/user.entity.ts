import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany, JoinColumn } from "typeorm";
import "reflect-metadata";
import { OtpVerification } from "./otpVerification.entity";
import { Address } from "./address.entity";
import { LoginSession } from "./loginSession.entity";
import { IsDefined } from "class-validator";
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from "../../../constants/autenticationConstants/userContants";

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
  @IsDefined()
  password: string

  @Column({ nullable: true })
  @IsDefined()
  reference_id: string

  @Column({ nullable: true })
  @IsDefined()
  @Index()
  phone_number: string

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

  @OneToMany(() => Address, address => address.user, { cascade: true, nullable: true })
  @JoinColumn({ name: 'addressId' })
  addresses: Address[]

  @OneToMany(() => LoginSession, session => session.user)
  login_sessions: LoginSession[];

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

}
