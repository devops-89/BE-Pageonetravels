import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Package } from "./package.entity";

@Entity('packageday')
export class PackageDay {

    @PrimaryGeneratedColumn('uuid')
    pkgday_id:string;

    @Column({ nullable: false })
    pkgday_duration: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}

