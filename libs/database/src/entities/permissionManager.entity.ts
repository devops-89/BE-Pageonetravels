import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { UserRole } from '../entities/userRoles.entity';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string; // e.g. "READ", "WRITE"

  @ManyToMany(() => UserRole, (role) => role.permissions)
  @JoinTable()
  roles: UserRole[];
}
