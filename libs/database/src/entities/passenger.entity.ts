import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from "typeorm";
import "reflect-metadata";

@Entity('passenger')
export class Passenger {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable:true,  type: 'jsonb' })
  passenger_details:[{}]

  @Column({ type: 'timestamp', default: () => 'now()' })
  updatedAt: Date

  @Column({ type: 'timestamp', default: () => 'now()' })
  createdAt: Date

}