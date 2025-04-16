import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import "reflect-metadata";


export enum EnquiryType {
    HELICOPTER= "Helicopter",
    DESTINATION_WEDDING= "Destination Wedding",
    CABS= "CABS",
    SELF_DRIVE= "Self Drive",
    OUTSTATION_CABS="Outstation Cabs",
    ACTIVITIE= "Activities",
  
}

@Entity('enquiry')
export class Enquiry{
    @PrimaryGeneratedColumn("uuid")
    enquiry_id: string;

    @Column({
        type: "enum",
        enum: EnquiryType
    })
    enquiry_type: EnquiryType;

    @Column({ type: 'text', nullable: false })
    enquiry_description: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
