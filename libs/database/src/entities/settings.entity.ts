import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('setting')
export class Setting {
  @PrimaryGeneratedColumn("uuid")
  id: string;  // UUID is a string, so change the type to string

  @Column({ type: 'varchar', unique: true })
  key: string;

  @Column({ type: 'json' })
  value: string;

  @Column({ type: 'varchar', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}