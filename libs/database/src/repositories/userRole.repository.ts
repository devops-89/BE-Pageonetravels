import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities/userRoles.entity';
import { Permission } from '../entities/permissionManager.entity';
import { PermissionService } from './permissionManager.repository';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,
    private permissionRepository: PermissionService
  ) {}

  async createRole(name: string, permissionIds: number[]): Promise<UserRole> {
    const permissions = await this.permissionRepository.getPermissionByPermissionIds(permissionIds);
    const userRole = new UserRole();
    userRole.name = name;
    userRole.permissions = permissions;

    return this.userRoleRepository.save(userRole);
    
  }

  async findAllRoles(): Promise<UserRole[]> {
    return this.userRoleRepository.find();
  }
}
