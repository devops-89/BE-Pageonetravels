import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindManyOptions, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

import { UserI } from '../../../interfaces/authentication/user.interface';
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';
import { paginate } from '../../../utils/basicUtils';
import { IPaginationObject } from '../../../interfaces/commonTypes/custom.interface';
import { group, count } from 'console';
import { UserFilterDto, PaginationDto } from 'libs/dtos/authentication/user.dto';
import { Address, Setting } from '../entities';

@Injectable()
export class UserRepositoryService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    private mapObject(obj: any): any {
        let resObj: any = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (obj[key]) resObj[key] = obj[key];
            }
        }

        return resObj;
    }

    async getUnverifiedUserById(userId: string): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                id: true,
                name: true,
                email: true,
                phone_no: true,
                reference_id: true,
                verify_status: true,
                password: true,
                avatar: true,
                roleName: true,
                group: true,
                // designation: true,
                createdAt: true,
                guestUserId: true
            };

            const user = await this.userRepository.findOne({ where: { id: userId }, select: selectFields });

            const passwordExist = !!(user && user.password);
            if (passwordExist) {
                user.password = '';
            }

            return user ? ({ ...user, passwordExist } as any) : null;
        } catch (error) {
            throw error;
        }
    }


    async getUnverifiedUserByEmail(email: string, getPassword = false): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                name: true,
                email: true,
                phone_no: true,
                reference_id: true,
                verify_status: true,
                password: true,
                avatar: true,
                roleName: true,
                group: true,
                // designation: true,
                status: true,
                id: true,
                isPhoneNoVerified: true,
                is_email_verified: true
            };

            const user = await this.userRepository.findOne({ where: { email }, select: selectFields, loadRelationIds: true });

            if (user && user.password && !getPassword) {
                user.password = '';
            }

            return (user as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async checkUserEmailExist(email: string): Promise<boolean> {
        try {
            const doc = await this.userRepository.count({ where: { email: email.toLowerCase().trim(), is_email_verified: true } });
            return doc > 0;
        } catch (error) {
            console.log('Error checking user by email in DB', error);
            throw error;
        }
    }


    async insertDefaultUser(input: UserI.InsertDefaultUser): Promise<User> {
        try {
            const { email, password, user_type, full_name, is_email_verified } = input;


            const insertVal = { email, password, user_type, full_name, is_email_verified: is_email_verified ? is_email_verified : false };

            const user = await this.userRepository.save(this.userRepository.create(insertVal));
            return user;
        } catch (error) {
            throw error;
        }
    }

    async addOrUpdateUser(input: UserI.AddOrUpdateUser, includeLastLogin: boolean = true): Promise<string | null> { 
        try {
            const { phone_number, avatar, id, roleName, user_type, email, password, full_name, is_email_verified} = input;
    
            // Create an object, conditionally including lastLogin
            const insertVal = { 
                phone_number, 
                avatar, 
                roleName, 
                user_type, 
                email, 
                password, 
                full_name, 
                is_email_verified,
            };
    
            const fields = this.mapObject(insertVal);
    
    
            let userId = null;
            if (id) {
                const r = await this.userRepository.update({ id }, fields);
                if (r.affected && r.affected > 0) {
                    userId = id;
                }
            } else {
                const user = await this.userRepository.insert(this.userRepository.create(fields));
                const userJson = JSON.parse(JSON.stringify(user));
                if (userJson.identifiers && userJson.identifiers.length > 0 && userJson.identifiers[0].id) {
                    userId = userJson.identifiers[0].id;
                }
            }
    
            return userId;
        } catch (error) {
            throw error;
        }
    }

    async getUserIdByPhoneNo(phone_number: string): Promise<UserI.UserSchema | null> {
        try {
            const doc = await this.userRepository.findOne({ where: { phone_number }, select: { id: true, status: true, verify_status: true } });
            return (doc as any) || null;
        } catch (error) {
            throw error;
        }
    }
}    