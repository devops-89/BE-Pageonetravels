import { IsString } from "class-validator";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Unique } from "typeorm";

@Entity('hotelcity')
@Unique(['city_code']) 
export class HotelCity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    country_code: string;

    @Column()
    @IsString()
    country_name: string;

    @Column()
    @IsString()
    city_name: string;

    @Column()
    city_code: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
