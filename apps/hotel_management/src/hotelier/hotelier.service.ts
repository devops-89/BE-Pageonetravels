import { Injectable } from "@nestjs/common";
import {LoginDto} from '../../../../libs/dtos/authentication/user.dto';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { COMMON_MSG, LOGIN_MSG } from "../../../../libs/constants/autenticationConstants/messageConstants";
import { UserRepositoryService } from "../../../../libs/database/src/repositories";
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { LOGIN_BY, USER_ACCOUNT_STATUS, USER_TYPE } from "libs/constants/autenticationConstants/userContants";
import { checkPasswordHash } from '../utils/bcryptUtil';
import { TOKEN_TYPE } from "../../../../libs/constants/commonConstants";
import { SESSION_STATUS } from "../../../../libs/constants/autenticationConstants/userContants";
import { LoginSessionI } from "../../../../libs/interfaces/authentication/loginSession.interface";
import { getRandomString } from "../../../../libs/utils/basicUtils";
import { JwtService } from "../../../../libs/jwt-service/jwt.service";
import { LoginSessionService } from "../../../../libs/database/src";
import { CreateHotelDto } from '../../../../libs/dtos/hotelier/create-hotel.dto';
import { HotelRepositoryService } from '../../../../libs/database/src/repositories/hotel.repository';
import { HotelRoomRepositoryService } from '../../../../libs/database/src/repositories/hotelRoom.repository';
import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotel-room.dto';


@Injectable()
export class HotelierService {
    constructor(
        private readonly UserModel: UserRepositoryService,
        private readonly hotelRepositoryService: HotelRepositoryService,
        private readonly hotelRoomRepositoryService: HotelRoomRepositoryService,
        private jwtService: JwtService, 
        private LoginSessionModel: LoginSessionService
    ){}

    async loginWithEmail(input: LoginDto,device_type: string): Promise<ApiResponse.ApiOK>{
        try{
            input.identity = input.identity.toLowerCase();
            const { identity, password, country_code } = input;
            const user = await this.UserModel.getUserByOnlyEmail(identity);
                if (!user) {
                throw {  message: LOGIN_MSG.INVALID_EMAIL_PASSWORD,  statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER  };
                }
                return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.EMAIL);
                return { message: `Hotelier Login Successfully`, data: user };
                //  return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.EMAIL);
        }catch(error){
            console.error("Hotelier Error Login with email", error);
            throw error;
        }
    }

    async loginWithPasswordHandler(   
        user,
        identity: string,
        password: string,
        loginBy: LOGIN_BY
    ): Promise<ApiResponse.ApiOK> {
        try {
           
            if(![USER_TYPE.HOTEL, USER_TYPE.HOTEL].includes(user.user_type)) {
                throw {  
                    message: "You are not authorized to access the website.", 
                    statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            
            if (user.status === USER_ACCOUNT_STATUS.BLOCKED) {
                throw { 
                    message: COMMON_MSG.BLOCKED_USER,
                    statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                throw { 
                    message: LOGIN_MSG.INACTIVE_ACCOUNT, 
                    statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            
            const isPasswordCorrect = await checkPasswordHash(password, user.password);
            
            if (!isPasswordCorrect) { 
                
                throw { 
                    message: LOGIN_MSG.INVALID_CREDENTIALS, 
                    statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            const token_data = {
                loginBy,
                login_identity: identity,
                // permissionId: user.permission,
                user_id: user.id,
                user_type: USER_TYPE.HOTEL
            };
            const { jwt_token, refresh_token } = await this.getLoginToken(token_data);
            
            const data = {
                access_token: jwt_token,
                refresh_token,
                user_type: user.user_type,
                name: user.full_name,
                email: user.email,
                reference_id: user.id,
                // phone_number:user.phone_number
            };
    
            return { 
                message: LOGIN_MSG.LOGIN_SUCCESS, 
                data 
            };
            
        } catch (error) {
            console.error("Error in loginWithPasswordHandler:", error);
            throw error;
        }
    }


    async getLoginToken(input: LoginSessionI.GetLoginToken) 
    {
        try {
            const { user_id, loginBy, login_identity, device_type, user_type } = input
            const refresh_token = getRandomString(16, false, false); 
            const expiryTimeStamp = Date.now() + 60 * 60 * 24 * 30 * 1000;   // 90 days

            const loginSession: LoginSessionI.insertLoginSession = {
                loginStatus: SESSION_STATUS.LOGGED_IN, refresh_token, refreshTokenExpiry: expiryTimeStamp, user_id, loginBy, login_identity ,device_type
            }

            const session = await this.LoginSessionModel.insertLoginSession(loginSession); 
            const jwt_token = await this.jwtService.generateJWTToken({
                reference_id: user_id,
                refresh_token,
                // user_role: role_name,
                session_id: session.id,
                user_type,
                token_type: TOKEN_TYPE.USER_LOGIN
            });

            return { jwt_token, refresh_token };
        }
        catch (error) {
            console.log("Error generate login token", error)
            throw error;
        }
    }


    async addHotel(body:CreateHotelDto){
        try{
            const result  = await this.hotelRepositoryService.createHotel(body);
            return { message: `Hotel Created Successfully`, data: result };
        }catch(error){
            console.log("Error in Add Hotel.", error);
            throw error;
        }
    }

    async addRoom(body:CreateHotelRoomDto){
        try{
            const result = await this.hotelRoomRepositoryService.createRoom(body);
            return { message: `Hotel Room Created Successfully`, data: body };
        }catch(error){
            console.log(error);
            throw error;
        }
    }

}