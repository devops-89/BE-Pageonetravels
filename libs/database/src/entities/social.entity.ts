import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('social')
export class Social{
    @PrimaryGeneratedColumn("uuid")
    social_id: string;

    @Column({ type: 'text', nullable: false })
    icon_image: string;

    @Column({ type: 'text', nullable: false })
    icon_link: string;

    @Column({ type: 'boolean', default: true })
    icon_status: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}