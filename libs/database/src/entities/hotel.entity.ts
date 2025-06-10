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
import { IsBoolean, IsObject } from 'class-validator';

export class AmenitiesDto {
  @IsBoolean()
  wifi: boolean;

  @IsBoolean()
  parking: boolean;

  @IsBoolean()
  ac: boolean;

  @IsBoolean()
  restaurant: boolean;

  @IsBoolean()
  pool: boolean;

  @IsBoolean()
  gym: boolean;

  @IsBoolean()
  spa: boolean;

  @IsBoolean()
  bar: boolean;

  @IsBoolean()
  laundry: boolean;
}

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
  gallery_images: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tax_percentage: number;


  @Column({ type: 'jsonb' })  // Use jsonb for PostgreSQL, or 'simple-json' for other databases
  @IsObject()
  amenities: AmenitiesDto;

  @Column({ type: 'uuid' })
  user_id: string;

  // @ManyToOne(() => User, user => user.hotels, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'user_id' })
  // user: User;

  @OneToMany(() => HotelRoom, (room) => room.hotel)
  rooms: HotelRoom[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}



