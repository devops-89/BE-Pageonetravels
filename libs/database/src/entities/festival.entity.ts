import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('festival')
export class Festival{
    @PrimaryGeneratedColumn("uuid")
    festival_id: string;

    @Column({ type: 'text', nullable: false })
    festival_image: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    festival_name: string;

    @Column({ type: 'text', nullable: false })
    festival_discount: string;

    @Column({ type: 'boolean', default: true })
    festival_status: boolean; 

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

} 