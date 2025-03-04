import { COMMISSION } from 'libs/constants/adminConstants';
import { COMMISSION_TYPE, TYPE_COMMISSION } from '../../../../libs/constants/autenticationConstants/userContants';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('commission')
export class Commission {
    
    @PrimaryGeneratedColumn("uuid")
    commission_id: string;

    @Column({
        type: 'enum',
        enum: COMMISSION_TYPE,
    })
    type: COMMISSION_TYPE;

    @Column({
        type: 'enum',
        enum: TYPE_COMMISSION
    })
    commission_type:TYPE_COMMISSION

    

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false, default: 0 })
    percentage: string;

    @Column({ default: false })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
