
/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { PermissionManagerService, UserRepositoryService } from '../../../../../libs/database/src';
import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { LoginService } from '../auth/services/login.service';
import { LOGIN_BY, USER_ACCOUNT_STATUS, USER_GROUP, USER_VERIFY_STATUS } from '../../../../../libs/constants/autenticationConstants/userContants';
import { COMMON_MSG, LOGIN_MSG, SIGNUP_MSG } from '../../../../../libs/constants/autenticationConstants/messageConstants';
import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';
import { UserI } from '../../../../../libs/interfaces/authentication/user.interface';
import { SocialLoginSignup } from '../../../../../libs/interfaces/authentication/socialLogin.interface';

@Injectable()
export class SocialAuthService {

    constructor( private readonly UserModel: UserRepositoryService, 
        private readonly LoginService: LoginService,
        private readonly PermissionModel: PermissionManagerService,
        ) {}

    
socialLoginOrSingup(input: SocialLoginSignup):Promise<ApiResponse.ApiOK>
{
    return new Promise(async (resolve, reject) => {
        try {
            const { email, name, loginSource } = input;

            input.email = input.email.toLowerCase();
            const group = USER_GROUP.USER;

           const user = await this.UserModel.getUserByEmail(input.email);
            if (!user) {

                const permission = await this.PermissionModel.getPermissionByRoleName({ group });
                if(!permission)
                {
                    reject({ message: SIGNUP_MSG.PERMISSION_NOT_FOUND, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                    return;
                }
    
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const permissionObj: any = {}
                if (permission) {
                    permissionObj.roleName = permission.roleName
                    permissionObj.group = permission.roleName
                    permissionObj.permission = permission.id
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const user: UserI.InsertUserByEmail =
                {
                    email: email.toLowerCase().trim(),
                    status: USER_ACCOUNT_STATUS.ACTIVE,
                    verifyStatus: USER_VERIFY_STATUS.VERIFIED,
                    loginSource,
                    name,
                    ...permissionObj,
                }
                //const userData = await this.UserModel.addOrUpdateByEmail(user);
                // const tokenData = { loginBy: LOGIN_BY.EMAIL, loginIdentity: input.email, permissionId: userData.permission, roleName: userData.roleName, userId: userData.id, group: userData.group };
           
                //  const {jwtToken, refreshToken} = await this.LoginService.getLoginToken(tokenData);
                
                // const data = {
                //     accessToken:jwtToken, 
                //     refreshToken,
                //     group: user.group,
                //     name: user.name,
                //     email: user.email,
                //     referenceId: user.id
                // }

                // resolve({ message: LOGIN_MSG.LOGIN_SUCCESS, data });
                return;


            }
//SELLER
            // if(!user.group)
            // {
            //     reject({ message: "You are not authorised to access the website.", statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
            //     return;
            // }

            if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                reject({ message: COMMON_MSG.BLOCKED_USER, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                return;
            }

            if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                reject({ message: LOGIN_MSG.INACTIVE_ACCOUNT, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                return;
            }


            const tokenData = { loginBy: LOGIN_BY.EMAIL, loginIdentity: input.email, permissionId: user.permission, roleName: user.roleName, userId: user.id, group: user.group };
           
            const {jwtToken, refreshToken} = await this.LoginService.getLoginToken(tokenData);

            const data = {
                accessToken:jwtToken, 
                refreshToken,
                group: user.group,
                name: user.name,
                email: user.email,
                referenceId: user.id
            }

            resolve({ message: LOGIN_MSG.LOGIN_SUCCESS, data });
            return

        } catch (error) {
            console.log("Error login with email", error);
            reject(error);
        }
    })
}
}
