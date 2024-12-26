import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('testimonial')
export class Testimonial{
    @PrimaryGeneratedColumn("uuid")
    testimonial_id: string;

    @Column({ type: 'text', nullable: false })
    testimonial_image: string;

    @Column({ type: 'text', nullable: false })
    testimonial_description: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    testimonial_name: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    testimonial_profession: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}


