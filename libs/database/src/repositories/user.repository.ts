import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, FindManyOptions, FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';

import { UserI } from '../../../interfaces/authentication/user.interface';
import { USER_ACCOUNT_STATUS, USER_TYPE, USER_VERIFY_STATUS } from '../../../constants/autenticationConstants/userContants';
import { paginate } from '../../../utils/basicUtils';
import { IPaginationObject } from '../../../interfaces/commonTypes/custom.interface';
import { UserFilterDto, PaginationDto } from 'libs/dtos/authentication/user.dto';
import { Address, Setting } from '../entities';
import { CostOptimizationHub } from 'aws-sdk';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';

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


    async getUnverifiedUserById(user_id: string): Promise<(UserI.UserSchema & { passwordExist: boolean }) | null> {
        try {
            const selectFields = {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                reference_id: true,
                verify_status: true,
                password: true,
                avatar: true,
                // role_name: true,
                user_type: true,
                // designation: true,
                created_at: true,
                //guestUserId: true
            };

            const user = await this.userRepository.findOne({ where: { id: user_id }, select: selectFields });

            const passwordExist = !(user && user.password);
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
                full_name: true,
                email: true,
                phone_number: true,
                reference_id: true,
                verify_status: true,
                password: true,
                avatar: true,
                user_type: true,
                // designation: true,
                status: true,
                id: true,
                is_phone_verified: true,
                is_email_verified: true
            };
            
            const user = await this.userRepository.findOne({ where: { email } });
            
            

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
            console.log('User Not Found', error);
            throw error;
        }
    }

    
    async emailIsExistsOrNot(email: string): Promise<boolean> {
        try {
            const doc = await this.userRepository.count({ where: { email: email} });
            return doc > 0;
        } catch (error) {
            console.log('User Not Found', error);
            throw error;
        }
    }

    async checkAdminEmail(email:string):Promise<User>{
        try{
            const checkAdmin = await this.userRepository.findOne({
                                where: { email: email.toLowerCase().trim() }
                                });
            return checkAdmin;
        }catch(error){
            console.log('Admin Email not Exist',error);
            throw error;
        }
    }


    async checkPhoneNumberExist(phone_number: string): Promise<boolean> {
        try {
            const doc = await this.userRepository.count({
                where: { phone_number: phone_number.trim(), is_phone_verified: true },
            });
            return doc > 0;
        } catch (error) {
            console.log('Phone Number Not Found', error);
            throw error;
        }
    }
    

    async insertDefaultUser(input: UserI.InsertDefaultUser): Promise<User> {
        try {
            const { email, status, password, user_type, full_name, is_email_verified } = input;

            const insertVal = { email, status, password, user_type, full_name, is_email_verified: is_email_verified ? is_email_verified : false , verify_status:USER_VERIFY_STATUS.VERIFIED};

            const user = await this.userRepository.save(this.userRepository.create(insertVal));
            return user;
        } catch (error) {
            throw error;
        }
    }

    async addOrUpdateUser(input: UserI.AddOrUpdateUser, includeLastLogin?:boolean): Promise<string | null> { 
        try {
            const { phone_number, avatar, id, user_type, email, password, full_name, is_email_verified, verify_status} = input;
    

            const insertVal = { 
                phone_number, 
                avatar, 
                user_type, 
                email, 
                password, 
                full_name, 
                is_email_verified,
                verify_status,
                status:'ACTIVE'
            };
    
            const fields = this.mapObject(insertVal);
    
            console.log(user_type);
            let user_id = null;
            if (id) {
                const r = await this.userRepository.update({ id }, fields);
                if (r.affected && r.affected > 0) {
                    user_id = id;
                }
            } else if(user_type === "HOTEL") {
                fields.verify_status = 'VERIFIED';
                const user = await this.userRepository.insert(this.userRepository.create(fields));
                const userJson = JSON.parse(JSON.stringify(user));
                if (userJson.identifiers && userJson.identifiers.length > 0 && userJson.identifiers[0].id) {
                    user_id = userJson.identifiers[0].id;
                }
            }else if(user_type === "USER") {
                fields.verify_status = 'UNVERIFIED';
                const user = await this.userRepository.insert(this.userRepository.create(fields));
                const userJson = JSON.parse(JSON.stringify(user));
                if (userJson.identifiers && userJson.identifiers.length > 0 && userJson.identifiers[0].id) {
                    user_id = userJson.identifiers[0].id;
                }
            }
    
            return user_id;
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

    
    async addOrUpdateByEmail(input: UserI.InsertUserByEmail): Promise<User | null> {
        try {
            const { email, verify_status, password, status, full_name,user_type, country_code,phone_number } = input;

            const updateFields = { email, verify_status, password, status,  full_name, user_type, country_code, phone_number };
            const insertVal = this.mapObject(updateFields);

            await this.userRepository.save(this.userRepository.create(insertVal));
            const user = await this.userRepository.findOne({ where: { email }, select: { password: false } });
            return user || null; 
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<(User) | null> {
        try {
            const user = await this.userRepository.findOne({ where: { email, verify_status: USER_VERIFY_STATUS.VERIFIED, is_email_verified: true }, loadRelationIds: true });
            return (user as any) || null;
        } catch (error) {
            console.log('Cannot Find User By Email', error);
            throw error;
        }
    }

    async getUserByOnlyEmail(email: string): Promise<(User) | null> {
        try {
            const user = await this.userRepository.findOne({ where: { email:email,user_type:USER_TYPE.HOTEL,status:USER_ACCOUNT_STATUS.ACTIVE} });
            return (user as any) || null;
        } catch (error) {
            console.log('Cannot Find User By Email', error);
            throw error;
        }
    }

    async getUserByPhoneNo(phone_number: string): Promise<(User) | null> {
        try {
            const user = await this.userRepository.findOne({ where: { phone_number, verify_status: USER_VERIFY_STATUS.VERIFIED, is_phone_verified: true }, loadRelationIds: true });
            return (user as any) || null;
        } catch (error) {
            console.log('Error in Fetching User By Phone Number', error);
            throw error;
        }
    }


    async updatePasswordByUserId(input: UserI.UpdatePasswordByUserId): Promise<void> {
        try {
            const { user_id, password } = input;
            await this.userRepository.update(user_id, { password });
            return;
        } catch (error) {
            console.log('Error to Update or Change Password', error);
            throw error;
        }
    }

    async updateProfile(input: Partial<UserI.UpdateProfile>): Promise<void> {
        try {
            const { user_id, ...updateFields } = input;
            const updateValue = this.mapObject(updateFields);
            if (Object.values(updateFields).length == 0)
                return;

            await this.userRepository.update({ id: user_id }, updateValue);
            return;
        } catch (error) {
            throw error;
        }
    }

    async getUserByUserId(user_id: string, showPassword = false): Promise<UserI.UserSchema | null> {
        try {
            const selectFields: Record<string, boolean> = {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                country_code: true,
                avatar: true,
                // role_name: true,
                user_type: true,
                //parent: true,
                is_phone_verified: true,
                is_email_verified: true,
                last_login: true,
                status: true,
                addresses: true,
                created_at: true,
            };
            if (showPassword) selectFields.password = true;
            
            const user = await this.userRepository.createQueryBuilder('user')
                .where('user.id = :user_id', { user_id })
                .andWhere('user.verify_status = :verify_status', { verify_status: USER_VERIFY_STATUS.VERIFIED })
                .getOne();
               
            //const user = await this.userRepository.findOne({where :{ id : user_id, verify_status : USER_VERIFY_STATUS.VERIFIED}})
            console.log("User  found", user);
                if (!user) {
                    console.log("User not found");
                    return null;
                }
                // const last_login = user
                // ?.loginSessions?.length
                // const last_login = user.loginSessions.length
                // ? user.loginSessions[0].created_at
                // : null;

            const result: Partial<UserI.UserSchema> = {};
            for (const key in selectFields) {
                if (selectFields[key] && user[key] !== undefined) {
                    result[key] = user[key];
                }
            }
            
            return result as UserI.UserSchema;
        } catch (error) {
            console.error("Error in Fetching User Details:", error);
            throw error
        }
    }

    async getUserByUserIdForAdmin(user_id: string, showPassword = false): Promise<UserI.UserSchema | null> {
        try {
            console.log(user_id
            )
            const selectFields: Record<string, boolean> = {
                id: true,
                full_name: true,
                email: true,
                phone_number: true,
                country_code: true,
                avatar: true,
                // role_name: true,
                user_type: true,
                //parent: true,
                is_phone_verified: true,
                is_email_verified: true,
                last_login: true,
                status: true,
                addresses: true,
                created_at: true,
            };
            if (showPassword) selectFields.password = true;
            
            const user = await this.userRepository.createQueryBuilder('user')
                .where('user.id = :user_id', { user_id })
                .getOne();
               
            //const user = await this.userRepository.findOne({where :{ id : user_id, verify_status : USER_VERIFY_STATUS.VERIFIED}})
            console.log("User  found", user);
                if (!user) {
                    console.log("User not found");
                    return null;
                }
                // const last_login = user
                // ?.loginSessions?.length
                // const last_login = user.loginSessions.length
                // ? user.loginSessions[0].created_at
                // : null;

            const result: Partial<UserI.UserSchema> = {};
            for (const key in selectFields) {
                if (selectFields[key] && user[key] !== undefined) {
                    result[key] = user[key];
                }
            }

            return result as UserI.UserSchema;
        } catch (error) {
            console.error("Error in Fetching User Details:", error);
            throw error
        }
    }

    async updateUserAddress(address_id: string, user_id:string) {
        try {
            let fields = this.mapObject({ address_id });
            if (address_id) {
                let addRef = new Address();
                addRef.id = address_id;
                fields.addreess = address_id;
            }

            let savedAdd = await this.userRepository.update({ id: user_id }, { ...fields });
            return savedAdd;
        } catch (error) {
            console.log("Error in Updating User Address")
            throw error;
        }
    }

    // async updateUserAddress(address_id: string, user_id: string) {
    //     try {
    //         // Prepare the fields for the update
    //         const fields = address_id ? { address: { id: address_id } } : {};
    
    //         // Update the user record with the new address reference
    //         const savedAdd = await this.userRepository.update({ id: user_id }, fields);
    
    //         // Return the updated record or status
    //         return savedAdd;
    //     } catch (error) {
    //         console.error("Error in updating user address:", error);
    //         throw error;
    //     }
    // }
    

    async getUsersWithFilters(filter: UserFilterDto, pagination: PaginationDto): Promise<IPaginationObject> {
        try {   
            const { user_type, search, status } = filter;
            const { page = 1, limit = 10 } = pagination;
        
            const queryBuilder = this.userRepository.createQueryBuilder('user')
                .leftJoinAndSelect('user.login_sessions', 'loginSession')
                .orderBy('user.created_at', 'DESC')
                .skip((page - 1) * limit)
                .take(limit);
            
            if(user_type) {
                queryBuilder.andWhere('user.user_type = :user_type', { user_type });
            }
        
            if (status) {
                queryBuilder.andWhere('user.status = :status', { status });
            } else {
                queryBuilder.andWhere('user.status != :status', { status: 'INACTIVE' })  // Exclude inactive status
            }
  
            if (search) {
                queryBuilder.andWhere(
                    '(user.full_name LIKE :search OR user.email LIKE :search OR user.phone_number LIKE :search)',
                    { search: `%${search}%` }
                );
            }
        
            const [data, count] = await queryBuilder.getManyAndCount();
            
            const userList = data.map(user => {   
                const last_login = user.login_sessions.length   
                    ? user.login_sessions.reduce((latest, session) => {  
                        return session.created_at > latest ? session.created_at : latest;  
                    }, user.login_sessions[0].created_at)  
                    : null; 
        
                return {
                    ...user,
                    last_login,
                };
            });
            console.log(userList);
            const sanitizedUserList = userList.map(user => {
                const { login_sessions, ...sanitizedUser } = user;
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
    async updateUserAccountStatus(input: UserI.UpdateUserAccountStatus): Promise<void> {
        try {
            const { status, user_id } = input;
            await this.userRepository.update(user_id, { status });
            return;
        }
        catch (error) {
            throw error;
        }
    }
}    