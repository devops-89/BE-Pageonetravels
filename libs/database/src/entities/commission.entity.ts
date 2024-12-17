import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('commission')
export class Commission {
    @PrimaryGeneratedColumn("uuid")
    commission_id: string;

    @Column({ nullable: false })
    type: string;

    @Column({ nullable: false })
    percentage: number;

    @Column({ default: false })
    status: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
