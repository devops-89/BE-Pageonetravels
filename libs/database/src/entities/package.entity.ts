import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { PackageCategory } from './packageCategory.entity';
import { PackageAmenite } from './packageAmenite.entity';



@Entity('packages')
@Index(['package_slug'])
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  package_name: string;

  @Column({ nullable: true })
  short_description: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  main_image: string;

  @Column({ nullable: true })
  gallery_image: string;

  @Column({ nullable: true })
  banner_image: string;

  @Column({ unique: true })
  package_slug: string;

  @Column()
  package_day: string;

  @Column()
  package_no_of_person: number;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // customize_day_price: number;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // customize_person_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  package_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;

  @Column()
  package_destination: string;

  @Column({ nullable: true })
  near_by_location: string;

  @Column()
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  country: string;

  @Column()
  zip: string;

  @Column()
  monthYear: string;

  @Column()
  package_type: string;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  highlight: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
