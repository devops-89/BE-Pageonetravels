import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import "reflect-metadata";

@Entity('package_details')
export class Package {
    @PrimaryGeneratedColumn("uuid")
    package_id: string;

    @Column({ type: 'text',  nullable: false })
    package_name: string;

    @Column({ type: 'text',  nullable: false })
    package_gallery: string;

    @Column({ type: 'text', nullable: false }) 
    package_banner: string;

    @Column({ type: 'text', nullable: false }) 
    package_thumbnail: string;

    @Column({ type: 'text',  nullable: false })
    destination: string;

    @Column({ type: 'text',  nullable: false })
    duration_day: string;

    @Column({ type: 'text',  nullable: false })
    duration_night: string;

    @Column({ type: 'text',  nullable: false })
    package_type: string;

    @Column({ type: 'text',  nullable: false })
    package_category: string;

    @Column({ type: 'text',  nullable: false })
    package_rating: string;

    @Column({ type: 'text',  nullable: false })
    places_to_visit: string;

    @Column({ type: 'text',  nullable: false })
    places_includes: string;

    @Column({ type: 'text',  nullable: false })
    package_overview: string;

    @Column({ type: 'text',  nullable: false })
    day_wise_itinerary: string;

    @Column({ type: 'text',  nullable: false })
    inclusions: string;

    @Column({ type: 'text',  nullable: false })
    exclusions: string;

    @Column({ type: 'text',  nullable: false })
    additional_info: string;

    @Column({ type: 'text',  nullable: false })
    package_discount: string;

    @Column({ type: 'text',  nullable: false })
    tax: string;

    @Column({ type: 'text',  nullable: false , default: '1'})
    per_person: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
