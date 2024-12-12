import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, OneToMany, JoinColumn } from "typeorm";
import "reflect-metadata";
import { LOGIN_BY, SESSION_STATUS} from "../../../constants/autenticationConstants/userContants";
import { User } from "./user.entity";
import { DEVICE_TYPE } from "../../../../libs/constants/commonConstants";


@Entity('loginsession')
export class LoginSession {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

  @ManyToOne(() => User, u => u.id)
  @JoinColumn({ name: "userId" })
  user: User

  @Column({
    type: 'enum',
    enum: LOGIN_BY,
  })
  loginBy: LOGIN_BY

  @Column()
  loginIdentity: string
  
  @Column({ nullable : true })
  fcmToken: string
  
  @Column({
    nullable:true,
    type : 'enum',
    enum:DEVICE_TYPE
  })
  deviceType: DEVICE_TYPE 

  @Column()
  refreshToken: string

  @Column({
    type: 'enum',
    enum: SESSION_STATUS,
  })
  loginStatus: SESSION_STATUS

  @Column({ type: 'bigint' })
  refreshTokenExpiry: number

}


