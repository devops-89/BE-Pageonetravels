import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import "reflect-metadata";

@Entity('about')
export class About{
    @PrimaryGeneratedColumn("uuid")
    about_id: string;

    @Column({ type: 'text',  nullable: false })
    about_heading: string;

    @Column({ type: 'text', nullable: false })
    about_description: string;

    @Column({ type: 'text', nullable: false }) // Multiple images
    about_image: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    about_button: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
