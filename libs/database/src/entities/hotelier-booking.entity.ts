// bookings/entities/booking.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Hotel } from './hotel.entity';
import { HotelRoomTypes } from './hotelier-room-types.entity';
@Entity('hotelier-bookings')
export class HotelierBooking {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Hotel, { onDelete: 'CASCADE' })
  hotel: Hotel;
  @ManyToOne(() => HotelRoomTypes, { onDelete: 'CASCADE' })
  roomType: HotelRoomTypes;
  @Column()
  guest_name: string;
  @Column()
  guest_email: string;
  @Column()
  rooms_booked: number;
  @Column({ type: 'date' })
  check_in: string; // inclusive
  @Column({ type: 'date' })
  check_out: string; // exclusive
  @Column({ default: 'CONFIRMED' })
  status: 'CONFIRMED' | 'CANCELLED';
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
  cancellationReason: string;
  cancelledAt: Date;
}
