import { COMMISSION } from 'libs/constants/adminConstants';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('commission')
export class Commission {
    
    @PrimaryGeneratedColumn("uuid")
    commission_id: string;

    @Column({ nullable: false}) 
    type: string;

    @Column({ type: 'float', nullable: false, default: 0 })
    percentage: number;

    @Column({ default: false })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
