import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Package } from "./package.entity";

@Entity('packageamenite')
export class PackageAmenite {

    @PrimaryGeneratedColumn('uuid')
    amenite_id:string

    @Column({ nullable: false })
    amenite_name: string;

    @Column({nullable: false})
    amenite_image: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}