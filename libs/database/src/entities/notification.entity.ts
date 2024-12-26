import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@Entity('address')
export class Notifications {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date

  @ManyToOne(() => User, user => user.addresses)
  // @JoinColumn({ name: "user_id" })
  user: User

  @Column()
  isdefault: boolean

  @Column()
  street: string

  @Column()
  house_number: string

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
  address_type: string

}
