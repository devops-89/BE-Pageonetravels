import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Package } from "./package.entity";

@Entity('packageday')
export class PackageDay {

    @PrimaryGeneratedColumn('uuid')
    pkgday_id: string;

    @Column({ type: 'int', nullable: false })
    pkgday_days: number;   // number of days (e.g., 2, 3, 5)

    @Column({ type: 'int', nullable: false, default: 0 })
    pkgday_nights: number; // number of nights (optional but recommended)

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}

