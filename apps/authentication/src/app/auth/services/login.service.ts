import { Injectable } from "@nestjs/common";
import { getRandomString } from "../../../../../../libs/utils/basicUtils";
import { JwtService } from "../../../../../../libs/jwt-service/jwt.service";
import { SESSION_STATUS } from "../../../../../../libs/constants/autenticationConstants/userContants";
import { LoginSessionI } from "../../../../../../libs/interfaces/authentication/loginSession.interface";
import { LoginSessionService } from "../../../../../../libs/database/src";
import { TOKEN_TYPE } from "../../../../../../libs/constants/commonConstants";


@Injectable()
export class LoginService {

    constructor(private jwtService: JwtService, private LoginSessionModel: LoginSessionService){}

async getLoginToken(input: LoginSessionI.GetLoginToken) 
{
    try {
        const { userId, loginBy, loginIdentity, roleName,  deviceType, user_type } = input
        const refresh_token = getRandomString(16, false, false);
        const expiryTimeStamp = Date.now() + 60 * 60 * 24 * 30 * 1000;   // 90 days

        const loginSession: LoginSessionI.insertLoginSession = {
            loginStatus: SESSION_STATUS.LOGGED_IN, refresh_token, refreshTokenExpiry: expiryTimeStamp, userId, loginBy, loginIdentity ,deviceType
        }

        const session = await this.LoginSessionModel.insertLoginSession(loginSession);
        const jwtToken = await this.jwtService.generateJWTToken({
            reference_id: userId,
            refresh_token,
            user_role: roleName,
            session_id: session.id,
            user_type,
            token_type: TOKEN_TYPE.USER_LOGIN
        });

        return { jwtToken, refresh_token };
    }
    catch (error) {
        console.log("Error generate login token", error)
        throw error;
    }

}

}