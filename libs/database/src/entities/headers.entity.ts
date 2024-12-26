import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('headers')
export class Headers {
    @PrimaryGeneratedColumn("uuid")
    header_id: string;

    @Column({ nullable: false })
    favicon: string; 

    @Column({ nullable: false })
    header_logo: string; 

    @Column("simple-array", { nullable: false })
    header_links: string[]; 

    @CreateDateColumn()
    created_at: Date; 

    @UpdateDateColumn()
    updated_at: Date; 
}
