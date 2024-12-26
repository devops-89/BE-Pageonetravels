import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('footer')
export class Footer{
    @PrimaryGeneratedColumn("uuid")
    footer_id: string;

    @Column({ type: 'text', nullable: false }) 
    footer_image: string;

    @Column({ type: 'text', nullable: false })
    footer_description: string;

    @Column({ type: 'text', nullable: false })
    our_services: string;

    @Column({ type: 'text', nullable: false })
    usefull_links: string;

    @Column({ type: 'text', nullable: false })
    contact_address: string;

    @Column({ type: 'text', nullable: false })
    contact_number: string;

    @Column({ type: 'text', nullable: false })
    contact_email: string;

    @Column({ type: 'text', nullable: false })
    copy_right: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
