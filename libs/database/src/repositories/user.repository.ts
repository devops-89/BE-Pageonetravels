import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindManyOptions, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserI } from '../../../interfaces/authentication/user.interface';
import { USER_ACCOUNT_STATUS, USER_GROUP, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';
import { PermissionManager } from '../entities/permissionManager.entity';
import { paginate } from '../../../utils/basicUtils';
import { IPaginationObject } from '../../../interfaces/commonTypes/custom.interface';
import { group, count } from 'console';
import { UserFilterDto, PaginationDto } from 'libs/dtos/authentication/user.dto';
import { Address } from '../entities';

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

    async addOrUpdateByEmail(input: UserI.InsertUserByEmail): Promise<User | null> {
        try {
            const { email, verifyStatus, parent, password, status, roleName, permission, name, group, addedBy, guestUserId } = input;

            const updateFields = { email, verifyStatus, parent, password, status, roleName, permission, name, group, addedBy, guestUserId };
            const insertVal = this.mapObject(updateFields);

            await this.userRepository.save(this.userRepository.create(insertVal));
            const user = await this.userRepository.findOne({ where: { email }, select: { password: false } });
            return user || null;
        } catch (error) {
            throw error;
        }
    }

    async checkUserEmailExist(email: string): Promise<boolean> {
        try {
            const doc = await this.userRepository.count({ where: { email: email.toLowerCase().trim(), verifyStatus: USER_VERIFY_STATUS.VERIFIED, isEmailVerified: true } });
            return doc > 0;
        } catch (error) {
            console.log('Error checking user by email in DB', error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<(User & { permission: number }) | null> {
        try {
            const user = await this.userRepository.findOne({ where: { email, verifyStatus: USER_VERIFY_STATUS.VERIFIED, isEmailVerified: true }, loadRelationIds: true });
            return (user as any) || null;
        } catch (error) {
            console.log('Error getting user by email from DB', error);
            throw error;
        }
    }

    async getUserByPhoneNo(phoneNo: string): Promise<(User & { permission: number }) | null> {
        try {
            const user = await this.userRepository.findOne({ where: { phoneNo, verifyStatus: USER_VERIFY_STATUS.VERIFIED, isPhoneNoVerified: true }, loadRelationIds: true });
            return (user as any) || null;
        } catch (error) {
            console.log('Error getting user by email from DB', error);
            throw error;
        }
    }

    async insertDefaultUser(input: UserI.InsertDefaultUser): Promise<User> {
        try {
            const { email, verifyStatus, password, status, group, loginSource, name, isEmailVerified } = input;


            const insertVal = { email, verifyStatus, password, status, group, loginSource, name, isEmailVerified: isEmailVerified ? isEmailVerified : false };

            const user = await this.userRepository.save(this.userRepository.create(insertVal));
            return user;
        } catch (error) {
            throw error;
        }
    }

    async insertUser(input: UserI.AddOrUpdateUser): Promise<User | null> {
        try {
            const { countryCode, phoneNo, status, verifyStatus, permission, roleName, group, email, password, name, parent } = input;

            const insertVal = { countryCode, phoneNo, status, verifyStatus, permission, roleName, group, email, password, name };
            const fields = this.mapObject(insertVal);

            if (permission) {
                let pRef = new PermissionManager();
                pRef.id = permission;
                fields.permission = pRef;
            }

            if (parent) {
                let parentRef = new User();
                parentRef.id = parent;
                fields.parent = parentRef;
            }

            const user = await this.userRepository.save(this.userRepository.create(fields));
            // if (user.raw && user.raw.length > 0 && user.raw[0].id) {
            //     userId = user.raw[0].id;
            // }

            return user as any;
        } catch (error) {
            throw error;
        }
    }
    async addOrUpdateUser(input: UserI.AddOrUpdateUser, includeLastLogin: boolean = true): Promise<number | null> { 
        try {
            const { countryCode, phoneNo, avatar, status, verifyStatus, id, permission, roleName, group, email, password, name, parent, isEmailVerified, lastLogin } = input;
    
            // Create an object, conditionally including lastLogin
            const insertVal = { 
                countryCode, 
                phoneNo, 
                status, 
                avatar, 
                verifyStatus, 
                permission, 
                roleName, 
                group, 
                email, 
                password, 
                name, 
                isEmailVerified,
                lastLogin
            };
    
            const fields = this.mapObject(insertVal);
    
            if (permission) {
                let pRef = new PermissionManager();
                pRef.id = permission;
                fields.permission = pRef;
            }
    
            if (parent) {
                let parentRef = new User();
                parentRef.id = parent;
                fields.parent = parentRef;
            }
    
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

    async updateRoleAndPermission(input: UserI.UpdateRoleAndPermission): Promise<void> {
        try {
            const { permission, roleName, userId } = input;

            let permissionRef = new PermissionManager();
            permissionRef.id = permission;

            await this.userRepository.update(userId, {
                permission: permissionRef,
                roleName,
            });
            return;
        } catch (error) {
            throw error;
        }
    }

    async checkUserPhoneNoExist(phoneNo: string): Promise<boolean> {
        try {
            const doc = await this.userRepository.exist({ where: { phoneNo, verifyStatus: USER_VERIFY_STATUS.VERIFIED, isPhoneNoVerified: true } });
            return doc;
        } catch (error) {
            throw error;
        }
    }

    async getUserIdByPhoneNo(phoneNo: string): Promise<UserI.UserSchema | null> {
        try {
            const doc = await this.userRepository.findOne({ where: { phoneNo }, select: { id: true, status: true, verifyStatus: true, group: true } });
            return (doc as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async updateUserStatus(input: UserI.UpdateUserStatus): Promise<void> {
        try {
            const { userId, status, verifyStatus, isEmailVerified, isPhoneNoVerified, password } = input;
            const updateFields = this.mapObject({ status, verifyStatus, isEmailVerified, isPhoneNoVerified, password })
            await this.userRepository.update(userId, updateFields);
            return;
        } catch (error) {
            throw error;
        }
    }

    async getUnverifiedUserByEmail(email: string, getPassword = false): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                verifyStatus: true,
                password: true,
                avatar: true,
                roleName: true,
                group: true,
                // designation: true,
                status: true,
                id: true,
                isPhoneNoVerified: true,
                isEmailVerified: true
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

    async getUnverifiedUserByPhone(phoneNo: string, getPassword = false): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                verifyStatus: true,
                password: true,
                avatar: true,
                roleName: true,
                group: true,
                // designation: true,
                status: true,
                id: true,
                isPhoneNoVerified: true,
                isEmailVerified: true
            };

            const user = await this.userRepository.findOne({ where: { phoneNo }, select: selectFields, loadRelationIds: true });

            if (user && user.password && !getPassword) {
                user.password = '';
            }

            return (user as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async getUnverifiedUserById(userId: number): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                verifyStatus: true,
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

    async getUserByUserId(userId: number, showPassword = false): Promise<UserI.UserSchema | null> {
        try {
            const selectFields: Record<string, boolean> = {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                avatar: true,
                roleName: true,
                group: true,
                parent: true,
                isPhoneNoVerified: true,
                isEmailVerified: true,
                lastLogin: true,
                status: true,
                addresses: true,
                createdAt: true,
            };
            if (showPassword) selectFields.password = true;

            const user = await this.userRepository.createQueryBuilder('user')
                .where('user.id = :userId', { userId })
                .andWhere('user.verifyStatus = :verifyStatus', { verifyStatus: USER_VERIFY_STATUS.VERIFIED })
                .getOne();

                if (!user) {
                    console.log("User not found");
                    return null;
                }
                // const lastLogin = user
                // ?.loginSessions?.length
                // const lastLogin = user.loginSessions.length
                // ? user.loginSessions[0].createdAt
                // : null;

            const result: Partial<UserI.UserSchema> = {};
            for (const key in selectFields) {
                if (selectFields[key] && user[key] !== undefined) {
                    result[key] = user[key];
                }
            }

            return result as UserI.UserSchema; // Ensure the returned type is as expected
        } catch (error) {
            console.error("Error in get User By UserId:", error);
            throw error
        }
    }
    
    
    
    

    // async getUserByUserDetailByFilter(input: { userId: number, parentId: number }, showPassword = false): Promise<UserI.UserSchema | null> {
    //     try {
    //         const { userId, parentId } = input;
    //         const selectFields: any = {
    //             id: true,
    //             name: true,
    //             email: true,
    //             phoneNo: true,
    //             countryCode: true,
    //             // countryName: true,
    //             avatar: true,
    //             roleName: true,
    //             group: true,
    //             parent: true,
    //             // designation: true,
    //             isPhoneNoVerified: true,
    //             isEmailVerified: true
    //         };

    //         if (showPassword) selectFields.password = true;
    //         let query: any = { id: userId, verifyStatus: USER_VERIFY_STATUS.VERIFIED };

    //         if (parentId) {
    //             query.parent = { id: parentId };
    //         }

    //         const user = await this.userRepository.findOne({ where: query, select: selectFields });

    //         console.log()
    //         return (user as any) || null;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async getUserByGroup(group: USER_GROUP): Promise<UserI.UserSchema[] | null> {
        try {
            const selectFields: any = {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                // countryName: true,
                avatar: true,
                roleName: true,
                group: true,
                parent: true,
                // designation: true,
                status: true
            };

            const user = await this.userRepository.find({ where: { group, verifyStatus: USER_VERIFY_STATUS.VERIFIED }, select: selectFields });
            return (user as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async updateEmailById(input: UserI.UpdateEmailById): Promise<void> {
        try {
            const { userId, email, isEmailVerified } = input;
            await this.userRepository.update(userId, { email, isEmailVerified });
            return;
        } catch (error) {
            console.log('Error updating email in DB', error);
            throw error;
        }
    }

    async updatePhoneById(input: UserI.UpdatePhoneById): Promise<void> {
        try {
            const { userId, phoneNo, isPhoneNoVerified, countryCode } = input;
            await this.userRepository.update(userId, { phoneNo, countryCode, isPhoneNoVerified });
            return;
        } catch (error) {
            console.log('Error updating phone number in DB', error);
            throw error;
        }
    }

    async updatePasswordByUserId(input: UserI.UpdatePasswordByUserId): Promise<void> {
        try {
            const { userId, password } = input;
            await this.userRepository.update(userId, { password });
            return;
        } catch (error) {
            console.log('Error updating password in DB', error);
            throw error;
        }
    }

    async updateProfile(input: Partial<UserI.UpdateProfile>): Promise<void> {
        try {
            const { userId, ...updateFields } = input;
            const updateValue = this.mapObject(updateFields);
            if (Object.values(updateFields).length == 0)
                return;

            await this.userRepository.update({ id: userId }, updateValue);
            return;
        } catch (error) {
            throw error;
        }
    }

    async getUserByRoleAndGroup(group: USER_GROUP, roleName: string): Promise<UserI.UserSchema | null> {
        try {
            const selectFields: any = {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                // countryName: true,
                avatar: true,
                roleName: true,
                group: true,
                parent: true,
                // designation: true,
            };

            const user = await this.userRepository.findOne({ where: { group, verifyStatus: USER_VERIFY_STATUS.VERIFIED, roleName: roleName }, select: selectFields });
            return (user as any) || null;
        } catch (error) {
            throw error;
        }
    }

    async updateUserAccountStatus(input: UserI.UpdateUserAccountStatus): Promise<void> {
        try {
            const { status, userId } = input;
            await this.userRepository.update(userId, { status });
            return;
        }
        catch (error) {
            throw error;
        }
    }

    async getUsersByFilter(input: UserI.GetUsersByFilter): Promise<IPaginationObject> {
        try {
            const { group, page, pageSize, status, parentId, search, isPhoneNoVerified, isEmailVerified } = input;
            const { currentPage, limit, offset } = paginate(page, pageSize);

            const selectFields: any = {
                id: true,
                name: true,
                email: true,
                phoneNo: true,
                countryCode: true,
                // countryName: true,
                avatar: true,
                roleName: true,
                group: true,
                parent: true,
                // designation: true,
                status: true,
                isEmailVerified: true,
                isPhoneNoVerified: true
            };

            const fields = this.mapObject({ group, status });
            fields.verifyStatus = USER_VERIFY_STATUS.VERIFIED;

            if (isPhoneNoVerified) {
                fields.isPhoneNoVerified = isPhoneNoVerified;
            }

            if (isEmailVerified) {
                fields.isEmailVerified = isEmailVerified;
            }

            if (parentId) {
                fields.parent = { id: parentId };
            }

            let searches = []
            if (search) {
                searches.push({ email: ILike(`${search}%`) });
                searches.push({ name: ILike(`${search}%`) });
                searches.push({ phoneNo: ILike(`${search}%`) });
            }


            const queryBuilder = this.userRepository
                .createQueryBuilder('user')
                .select([])
                .where(fields)
                .andWhere(searches)
                .skip(offset)
                .take(limit)

            queryBuilder.addOrderBy('user.createdAt', `DESC`);

            for (const key in selectFields) {
                if (selectFields[key]) {
                    queryBuilder.addSelect(`user.${key}`);
                }
            }
            const [userList, count] = await queryBuilder.getManyAndCount();

            const totalPages = Math.ceil(count / limit);
            const paginateObject: IPaginationObject = {
                docs: userList,
                hasNextPage: input.page < totalPages,
                hasPrevPage: input.page > 1,
                limit: limit,
                page: currentPage,
                totalDocs: count,
                totalPages,
            };

            return paginateObject;
        } catch (error) {
            throw error;
        }
    }


    async getAllDesignation(userGroups: USER_GROUP[]): Promise<string[]> {
        try {

            const placeholders = userGroups.map((_, index) => `$${index + 1}`).join(', ');

            let query = `SELECT DISTINCT(designation) as designation  FROM public.user WHERE designation IS NOT NULL AND "group" IN (${placeholders})`;
            const designations = await this.userRepository.query(query, userGroups);

            let resultSet = new Set<string>();
            for (const desig of designations) {
                // result.push(desig.designation);
                resultSet.add(desig.designation.toUpperCase())
            }
            return Array.from(resultSet);
        } catch (error) {
            throw error;
        }
    }

    async getUserCounts(input: { groups: USER_GROUP[] }): Promise<[{ userCount: number, group: string }]> {
        try {
            const { groups } = input;
            const groupIN = groups.map((_, index) => `$${index + 1}`).join(', ');

            let whereF = `"verifyStatus"= 'VERIFIED'`;
            if (groupIN) {
                whereF += ` and "group" IN(${groupIN})`;
            }

            if (whereF) {
                whereF = ` where ${whereF}`;
            }

            const query = `SELECT count("id") AS "userCount", "group" FROM public."user" 
            ${whereF ? whereF : ''}
            GROUP BY "user"."group";`;

            const result = await this.userRepository.query(query, groups);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // async getUserByPhoneEmailExludeId({email:string}): Promise<string[]> {
    //     try {
    //         // const placeholders = userGroups.map((_, index) => `$${index + 1}`).join(', ');
    //         const selectFields = {
    //             name: true,
    //             email: true,
    //             phoneNo: true,
    //             countryCode: true,
    //             verifyStatus: true,
    //             password: true,
    //             avatar: true,
    //             roleName: true,
    //             group: true,
    //             designation: true,
    //             status: true,
    //             id: true,
    //         };
    //         let whrf = ``;
    //         if(email)
    //             {

    //             }
    //         let query = `SELECT ${Object.keys(selectFields).join(', ')} FROM public.user WHERE designation IS NOT NULL AND "group" IN (${placeholders})`;
    //         const designations = await this.userRepository.query(query, userGroups);

    //         let resultSet = new Set<string>();
    //         for (const desig of designations) {
    //             // result.push(desig.designation);
    //             resultSet.add(desig.designation)
    //         }
    //         return Array.from(resultSet);
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async getUsersWithFilters(filter: UserFilterDto, pagination: PaginationDto): Promise<IPaginationObject> {
        try {   
            const { group, search, status } = filter;
            const { page = 1, limit = 10 } = pagination;
        
            const queryBuilder = this.userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.loginSessions', 'loginSession')
                .orderBy('user.createdAt', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
        
            // Check if group and status are provided
            if (group) {
                queryBuilder.andWhere('user.group = :group', { group });
            }
        
            if (status) {
                queryBuilder.andWhere('user.status = :status', { status });
            } else {
                queryBuilder.andWhere('user.status != :status', { status: 'INACTIVE' })  // Exclude inactive status
            }
        
            // Create search conditions if search term is provided
            if (search) {
                queryBuilder.andWhere(
                    '(user.name LIKE :search OR user.email LIKE :search OR user.phoneNo LIKE :search)',
                    { search: `%${search}%` }
                );
            }
        
            const [data, count] = await queryBuilder.getManyAndCount();
        
            const userList = data.map(user => {
                const lastLogin = user.loginSessions.length
                    ? user.loginSessions.reduce((latest, session) => {
                        return session.createdAt > latest ? session.createdAt : latest;
                    }, user.loginSessions[0].createdAt)
                    : null;
        
                return {
                    ...user,
                    lastLogin,
                };
            });
        
            const sanitizedUserList = userList.map(user => {
                const { loginSessions, ...sanitizedUser } = user;
                return sanitizedUser;
            });
        
            const paginateObject: IPaginationObject = {
                docs: sanitizedUserList,
                limit: limit,
                totalDocs: count,
                totalPages: Math.ceil(count / limit),
                hasPrevPage: page > 1,
                hasNextPage: (page * limit) < count,
            };
        
            return paginateObject;
        }
        catch(error){
            console.log("Error in user list ");
            throw error;
        }
    }

    async updateUserAddress(addressId: number, userId: number) {
        try {
            let fields = this.mapObject({ addressId });
            if (addressId) {
                let addRef = new Address();
                addRef.id = addressId;
                fields.addreess = addressId;
            }

            let savedAdd = await this.userRepository.update({ id: userId }, { ...fields });
            return savedAdd;
        } catch (error) {
            console.log("Error in the update user address")
            throw error;
        }
    }
}    