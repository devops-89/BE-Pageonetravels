import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '../entities/permissionManager.entity';
import { of } from 'rxjs';
// import { PermissionManagerI } from '../../../interfaces/authentication/permissionManager.interface';
// import { USER_GROUP } from '../../../../libs/constants/autenticationConstants/userContants';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }


  async createBulkPermission(names: string[]) {
    try {
      const permissions = names.map((name) => {
        let permission = new Permission();
        permission.name = name;
        return permission
      })

      const result = await this.permissionRepository.insert(permissions)
      return result.identifiers;

    } catch (error) {
      console.log("Failed to create permission", error);
      throw error
    }
  }



  async createPermission(name: string): Promise<Permission> {
    try {

      const permission = new Permission();
      permission.name = name;
      return this.permissionRepository.save(permission);

    } catch (error) {
      console.log("Failed to create permission", error);
      throw error
    }

  }

  async findAllPermissions(): Promise<Permission[]> {
    try {
      const result = this.permissionRepository.find();
      return result;
    } catch (error) {

      console.log("Failed to get permission", error);
      throw error
    }

  }


  async getPermissionByPermissionIds(IDs: number[]): Promise<Permission[]> {
    try {
      const result = this.permissionRepository.find({
        where: {
          id: In(IDs)
        }
      });
      return result;

    } catch (error) {
      console.log("Failed to get permission", error);
      throw error
    }

  }
}
