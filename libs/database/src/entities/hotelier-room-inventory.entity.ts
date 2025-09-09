// entities/hotelier-room-inventory.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { HotelRoomTypes } from './hotelier-room-types.entity';

@Entity('room_inventory')
@Unique(['roomType', 'date'])
export class RoomInventory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => HotelRoomTypes, (rt) => rt.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_type_id' })
  roomType: HotelRoomTypes;

  @Column({ type: 'date' })
  date: string;

  @Column()
  total_rooms: number;

  @Column()
  available_rooms: number;

  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  price?: number | null;

  @Column({ type: 'boolean', default: false })
  is_closed: boolean; // NEW: explicit closed flag
}
