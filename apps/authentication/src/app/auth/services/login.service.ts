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
        const { userId, loginBy, loginIdentity, roleName, permissionId, group, deviceType } = input
        const refreshToken = getRandomString(16, false, false);
        const expiryTimeStamp = Date.now() + 60 * 60 * 24 * 30 * 1000;   // 90 days

        const loginSession: LoginSessionI.insertLoginSession = {
            loginStatus: SESSION_STATUS.LOGGED_IN, refreshToken, refreshTokenExpiry: expiryTimeStamp, userId, loginBy, loginIdentity ,deviceType
        }

        const session = await this.LoginSessionModel.insertLoginSession(loginSession);
        const jwtToken = await this.jwtService.generateJWTToken({
            referenceId: userId,
            refreshToken,
            userRole: roleName,
            permissionId,
            sessionId: session.id,
            group,
            tokenType: TOKEN_TYPE.USER_LOGIN
        });

        return { jwtToken, refreshToken };
    }
    catch (error) {
        console.log("Error generate login token", error)
        throw error;
    }

}

}