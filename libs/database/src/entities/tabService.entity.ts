import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tabService')
export class TabService{
    @PrimaryGeneratedColumn("uuid")
    service_id: string;

    @Column({ type: 'text', nullable: false })
    service_image: string;

    @Column({ type: 'varchar', length: 255, nullable: false })
    service_name: string;

    @Column({ type: 'boolean', default: true })
    service_status: boolean;    

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}