import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn("uuid")
  id: string;  

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

  @ManyToOne(() => User, user => user.addresses)
  // @JoinColumn({ name: "userId" })
  user: User

  @Column()
  isDefault: boolean

  @Column()
  street: string

  @Column()
  houseNo: string

  @Column()
  postal_code: string

  @Column()
  city: string

  @Column()
  country: string

  @Column()
  state: string

  @Column({
    type: 'enum',
    enum: ["OFFICE", "HOME", "OTHER"],
    default: "HOME"
  })
  addressType: string

}
