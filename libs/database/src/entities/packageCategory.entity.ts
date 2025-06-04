import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Package } from "./package.entity";

@Entity('packagecategory')
export class PackageCategory {

    @PrimaryGeneratedColumn('uuid')
    category_id:string

    @Column({ nullable: false })
    category_name: string;

    @Column({nullable: false})
    category_image: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}

