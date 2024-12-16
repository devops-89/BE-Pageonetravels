import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Setting {
  @PrimaryGeneratedColumn("uuid")
  id: string;  // UUID is a string, so change the type to string

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'varchar' })
  value: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}