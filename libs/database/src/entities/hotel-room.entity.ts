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
  gallery_images: string[];

  // Amenities
  @Column({ type: 'boolean', default: false })
  wifi: boolean;

  @Column({ type: 'boolean', default: false })
  ac: boolean;

  @Column({ type: 'boolean', default: false })
  tv: boolean;

  @Column({ type: 'boolean', default: false })
  balcony: boolean;

  @Column({ type: 'boolean', default: false })
  attached_bathroom: boolean;

  @Column({ type: 'boolean', default: false })
  room_service: boolean;

  @Column({ type: 'boolean', default: false })
  breakfast_included: boolean;

  @Column({ type: 'int', default: 1 })
  number_of_rooms: number;

  @Column({ type: 'int', default: 1 })
  available_rooms: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}