/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { JWTPayload } from '../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { LoginSessionService } from '../../../../../libs/database/src';
import { LOGOUT_MSG } from '../../../../../libs/constants/autenticationConstants/messageConstants';

@Injectable()
export class LogoutService {

    constructor(private readonly LoginSessionModel: LoginSessionService){}

logoutCurrentSession(userPayload: JWTPayload): Promise<ApiResponse.ApiOK>
{
    return new Promise(async(resolve, reject)=>{
        try {

            const { sessionId } = userPayload;
            await this.LoginSessionModel.logoutCurrentSession(sessionId);

            resolve({ message: LOGOUT_MSG.LOGOUT_CURRENT, data: null });
            return;
            
        } catch (error) {
            reject(error);
            return;
        }
    })
}

logoutAllSession(userPayload: JWTPayload): Promise<ApiResponse.ApiOK>
{
    return new Promise(async(resolve, reject)=>{
        try {

            const { referenceId } = userPayload;
            await this.LoginSessionModel.logoutAllSessionDb(referenceId);

            resolve({ message: LOGOUT_MSG.LOGOUT_ALL, data: null });
            return;
            
        } catch (error) {
            reject(error);
            return;
        }
    })
}

}
