import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'hoteltbocode' })
export class HotelTboCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  city_code: string;

  @Column()
  city_name: string;

  @Column()
  country_code: string;

  @Column()
  country_name: string;

  // 🔹 Store all hotel codes as a single comma-separated string
  @Column({ type: 'text', nullable:true })
  hotel_codes: string;
}
