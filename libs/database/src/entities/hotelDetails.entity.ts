
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn, OneToOne } from 'typeorm';
import {HotelCode} from "../entities";
export enum HotelRatingEnum {
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}

@Entity('hoteldetails')
export class HotelDetails {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar' })
    hotelCode: string;



    @Column({ nullable: true })
    hotelName: string;

    @Column({ type: "text", nullable: true })
    description: string;

    @Column({ type: "json", nullable: true })
    hotelFacilities: string[];

    @Column({ type: "json", nullable: true })
    attractions: Record<string, any>;

    @Column({type:'varchar',nullable:true})
    image:string;

    @Column({ type: "json", nullable: true })
    images: string[];

    @Column({ type: "json", nullable: true })
    roomIds: string[];

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    pinCode: string;

    @Column({ nullable: true })
    cityId: string;

    @Column({ nullable: true })
    cityName: string;

    @Column({ nullable: true })
    countryName: string;

    @Column({ nullable: true })
    countryCode: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ nullable: true })
    faxNumber: string;

    // ⭐ ENUM hotel rating column
    @Column({
        type: "enum",
        enum: HotelRatingEnum,
        nullable: true,
    })
    hotelRating: HotelRatingEnum;

    @Column({ nullable: true })
    map: string;

    @Column({ nullable: true })
    checkInTime: string;

    @Column({ nullable: true })
    checkOutTime: string;
}
