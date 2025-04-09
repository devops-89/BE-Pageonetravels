import { IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('hotelcity')
export class HotelCity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @IsString()
    country_code: string;

    @Column()
    @IsString()
    country_name: string;

    @Column()
    @IsString()
    city_name: string;

    @Column()
    @IsString()
    city_code: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
} 

