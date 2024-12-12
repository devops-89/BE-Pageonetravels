import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany, JoinColumn } from "typeorm";
import "reflect-metadata";
import { USER_GROUP, USER_GROUP_ROLE, USER_LOGIN_SOURCE } from "../../../constants/autenticationConstants/userContants";
import { OtpVerification } from "./otpVerification.entity";
import { Address } from "./address.entity";
import { LoginSession } from "./loginSession.entity";
import { IsDefined } from "class-validator";


@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  @IsDefined()
  fullName: string

  @Column({nullable : true})
  @IsDefined()
  avatar:string

  @Column({ nullable: true })
  @IsDefined()
  @Index()
  email: string

  @Column({ nullable: true })
  @IsDefined()
  @Index()
  phoneNo: string

  @Column({ default: false })
  isPhoneNoVerified: boolean

  @Column({ nullable: true })
  @IsDefined()
  countryCode: string

  @Column({ nullable: true })
  @IsDefined()
  password: string


  @Column({
    type: 'enum',
    enum: USER_GROUP,
  })
  userGroup: USER_GROUP;

  @Column({
    type: 'enum',
    enum: USER_LOGIN_SOURCE,
    nullable: true
  })
  @IsDefined()
  loginSource: USER_LOGIN_SOURCE;


  @OneToMany(() => OtpVerification, (o) => o.user)
  otpVerifications: OtpVerification[]

  @OneToMany(() => Address, address => address.user, { cascade: true, nullable: true })
  @JoinColumn({ name: 'addressId' })
  addresses: Address[]

  @OneToMany(() => LoginSession, session => session.user)
  loginSessions: LoginSession[];

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

}
