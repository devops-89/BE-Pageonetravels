import { IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { HotelCity } from "./hotelCity.entity";

@Entity('hoteldetails')
export class HotelDetails {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @IsString()
    country_name: string;

    @Column()
    @IsString()
    country_code: string;

    @Column()
    @IsString()
    city_code: string;

    @Column()
    @IsString()
    hotel_code: string;

    
    @IsString()
    @Column({ type: 'text', nullable: true })
    hotel_details: string;


    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}