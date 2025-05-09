import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { HotelRoom } from './hotel-room.entity';


@Entity('hotel')
export class Hotel {
  @PrimaryGeneratedColumn("uuid")
  hotel_id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  type: string;

  @Column({ type: 'int', default: 3 })
  star_rating: number;

  @Column()
  address_line: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  postal_code: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number;

  @Column()
  contact_name: string;

  @Column()
  contact_email: string;

  @Column()
  contact_phone: string;

  @Column({ nullable: true })
  alternate_phone: string;

  @Column({ type: 'time' })
  check_in_time: string;

  @Column({ type: 'time' })
  check_out_time: string;

  @Column('text')
  cancellation_policy: string;

  @Column('text', { nullable: true })
  child_policy: string;

  @Column('text', { nullable: true })
  pet_policy: string;

  @Column()
  main_image: string;

  @Column('simple-array', { nullable: true })
  gallery_images: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tax_percentage: number;

  @Column()
  currency: string;

  // Boolean amenities
  @Column({ default: false }) wifi: boolean;
  @Column({ default: false }) parking: boolean;
  @Column({ default: false }) ac: boolean;
  @Column({ default: false }) restaurant: boolean;
  @Column({ default: false }) pool: boolean;
  @Column({ default: false }) gym: boolean;
  @Column({ default: false }) spa: boolean;
  @Column({ default: false }) bar: boolean;
  @Column({ default: false }) laundry: boolean;

  
  /** foreign key column referencing User.id */
  @Column({ type: 'uuid' })
  user_id: string;

  /** relation: many hotels to one user */
  @ManyToOne(() => User, user => user.hotels, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => HotelRoom, (room) => room.hotel)
  rooms: HotelRoom[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  

}


