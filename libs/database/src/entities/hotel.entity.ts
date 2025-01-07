import {Entity, Column, PrimaryGeneratedColumn, CreateDateColumn,
  } from 'typeorm';
  
  @Entity('hotel') // Replace 'hotel' with your actual table name
  export class Hotel {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;
  
    @Column({ unique: true })
    hotel_id: string;
  
    @Column()
    name: string;
  
    @Column()
    city: string;
  
    @Column()
    location: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price: number;
  
    @Column('decimal', { precision: 2, scale: 1 })
    rating: number;
  
    @Column()
    available_rooms: number;
  
    @Column('simple-json')
    amenities: string[]; // Stored as JSON
  
    @CreateDateColumn()
    created_at: Date;
  }
  