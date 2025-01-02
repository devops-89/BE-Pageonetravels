import "reflect-metadata";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";

@Entity('airport')
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id: string
  				
  @Column({ type: 'timestamp', default: () => 'now()' })
  created_at: Date

  @Column({ unique: true })
  iata_code: string

  @Column({})
  airport_name: string

  @Column()
  city_name: string

  @Column()
  city_code: string

  @Column()
  country_code: string

}
