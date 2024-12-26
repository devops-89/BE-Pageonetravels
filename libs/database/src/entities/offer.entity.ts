import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('offer')
export class Offer{
    @PrimaryGeneratedColumn("uuid")
    offer_id: string;

    @Column({ type: 'text', nullable: false }) // Multiple images
    offer_image: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    offer_title: string;

    @Column({ type: 'text', nullable: false })
    offer_description: string;

    @Column({ type: 'text', nullable: false })
    offer_listing: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    button_name: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}

