import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { HotelRoomTypes } from './hotelier-room-types.entity';
import { IsBoolean } from 'class-validator';
// @Entity('room_inventory')
// @Unique(['roomTypeId', 'date'])
// export class RoomInventory {
//   @PrimaryGeneratedColumn()
//   id: number;
//   @ManyToOne(() => HotelRoomTypes, (rt) => rt.inventory, { eager: true, onDelete: 'CASCADE' })
//   @JoinColumn({ name: 'roomTypeId' })
//   roomType: HotelRoomTypes;
//   @Column()
//   roomTypeId: string; // :point_left: relation ka FK column
//   @Column({ type: 'date' })
//   date: string; // YYYY-MM-DD
//   @Column()
//   total_rooms: number;
//   @Column()
//   available_rooms: number;
//   @Column('numeric', { precision: 10, scale: 2, nullable: true })
//   price?: number;
// }
@Entity('room_inventory')
@Unique(['roomType', 'date'])   // :point_left: move here
export class RoomInventory {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => HotelRoomTypes, (rt) => rt.inventory)
    @JoinColumn({ name: 'room_type_id' })
    roomType: HotelRoomTypes;
    @Column({ type: 'date' })
    date: string;
    @Column()
    total_rooms: number;
    @Column()
    available_rooms: number;
    @Column('numeric', { precision: 10, scale: 2, nullable: true })
    price?: number;
}











