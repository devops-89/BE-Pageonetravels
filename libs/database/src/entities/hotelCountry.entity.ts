import { IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('hotelcountry')
export class HotelCountry {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    @IsString()
    code: string;

    @Column()
    @IsString()
    name: string;
}