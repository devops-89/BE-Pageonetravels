import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
  
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
    amenities: string[];
    
    @Column({ type: 'timestamp', default: () => 'now()' })
    created_at: Date

    @Column({ type: 'timestamp', default: () => 'now()' })
    updated_at: Date
  }
  