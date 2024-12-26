import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('banner')
export class Banner{
    @PrimaryGeneratedColumn("uuid")
    banner_id: string;

    @Column({ type: 'text', nullable: false }) // Multiple images
    banner_image: string;

    @Column({ type: 'varchar', length: 255, nullable:false })
    banner_title: string;

    @Column({ type: 'varchar', length: 255, nullable:false })
    banner_heading: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date; 

}