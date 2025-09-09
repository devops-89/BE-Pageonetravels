import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Hotel } from './hotel.entity';
import { IsObject,IsBoolean } from 'class-validator';


export class RoomAmenitiesDto {
  @IsBoolean()
  wifi: boolean;

  @IsBoolean()
  ac: boolean;

  @IsBoolean()
  tv: boolean;

  @IsBoolean()
  balcony: boolean;

  @IsBoolean()
  attached_bathroom: boolean;

  @IsBoolean()
  room_service: boolean;

  @IsBoolean()
  breakfast_included: boolean;
}


@Entity('hotel_rooms')
export class HotelRoom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column({ type: 'varchar', length: 100 })
  room_type: string;

  @Column({ type: 'varchar', length: 255 })
  room_title: string;

  @Column({ type: 'text', nullable: true })
  room_description: string;

  @Column({ type: 'int', default: 2 })
  max_adults: number;

  @Column({ type: 'int', default: 0 })
  max_children: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  tax_percentage: number;

  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  main_image: string;

  @Column({ type: 'simple-array', nullable: true })
  gallery_images: string;

  @Column({ nullable:true,  type: 'jsonb' }) // Use 'json' or 'simple-json' for non-PostgreSQL DBs
  @IsObject()
  amenities: RoomAmenitiesDto;

  @Column({ type: 'int', default: 1 })
  number_of_rooms: number;

  @Column({ type: 'int', default: 1 })
  available_rooms: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}


