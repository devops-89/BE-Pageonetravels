import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from 'typeorm';
import { User } from '../entities/user.entity';
import { Permission } from '../entities/permissionManager.entity';

@Entity()
export class UserRole {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // e.g. "Admin", "User", "Guest"

  @ManyToMany(() => Permission, (permission) => permission.roles, { eager: true })
  permissions: Permission[];

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
