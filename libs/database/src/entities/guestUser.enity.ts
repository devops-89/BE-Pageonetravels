import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';


@Entity('guestuser')
export class GuestUser {
    
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({default : false}) 
    isUserRegistered: boolean;

    @Column({ nullable : false, unique : true })
    guest_id: number;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

  
}
