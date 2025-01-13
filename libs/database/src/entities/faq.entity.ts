import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('faq')
export class Faq{

    @PrimaryGeneratedColumn("uuid")
    faq_id: string;

    @Column({ type: 'text', nullable: false })
    faq_question: string;

    @Column({ type: 'text', nullable: false })
    faq_answer: string;

    @Column({  default: true })
    faq_status: string; 

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
