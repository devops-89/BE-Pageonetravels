import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("hotelcode")
export class HotelCode {
  @PrimaryColumn()
  hotelCode: string;

  @Column()
  hotelName: string;

  @Column({ nullable: true })
  hotelRating: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  attractions: string;

  @Column({ nullable: true })
  countryName: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  faxNumber: string;

  @Column({ nullable: true })
  hotelFacilities: string;

  @Column()
  cityCode: number;
}
