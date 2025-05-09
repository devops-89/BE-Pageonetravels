import { Injectable } from "@nestjs/common";
import { RegisterDto } from "../../../../libs/dtos/authentication/user.dto";
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_TYPE, USER_VERIFY_STATUS } from "../../../../libs/constants/autenticationConstants/userContants";
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
import { COMMON_MSG } from "libs/constants/autenticationConstants/messageConstants";
import { validateEmail } from "../../../../libs/utils/basicUtils";
import { UserI } from '../../../../libs/interfaces/authentication/user.interface';
import { generatePasswordHash } from '../utils/bcryptUtil';
import { UserRepositoryService } from '../../../../libs/database/src';


@Injectable()
export class HotelierService {
    constructor(
        private readonly UserModel: UserRepositoryService,
    ){}

    async registerWithEmailPassword(input: RegisterDto): Promise<ApiResponse.ApiOK>{
        try {
            input.email = input.email.toLowerCase();
            const { email, password, full_name, user_type, phone_number, country_code } = input;
            let user_id: string;

            if (!user_type) {
                input.user_type = USER_TYPE.HOTEL;
            }

            // if (!validateEmail(email)) {
            //     throw { message: COMMON_MSG.INVALID_EMAIL, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            // }

            // my code start
            const user = await this.UserModel.getUnverifiedUserByEmail(email);
            if(user){
                throw { message: "Email Already Exist.", statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            if ((!user)) {
                const password_hash = await generatePasswordHash(password.trim());
                const userObj: UserI.AddOrUpdateUser = {
                    email,
                    full_name:full_name,
                    password:password_hash,
                    status: USER_ACCOUNT_STATUS.ACTIVE,
                    verify_status: "VERIFIED",
                    loginSource: USER_LOGIN_SOURCE.LOCAL,
                    user_type: USER_TYPE.HOTEL,
                    phone_number:phone_number,
                    country_code:country_code
                } as UserI.AddOrUpdateUser

                console.log(userObj);
                let insertedId = await this.UserModel.addOrUpdateUser(userObj);
                if (!insertedId) {
                    throw { message: COMMON_MSG.INVALID_REQUEST, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
                }

                // user_id = insertedId;
                return { message: `Hotelier Created Successfully`, data: user_id };
            }
        }catch(error){
            console.log('Error Hotelier:', error);
            throw error;
        }
    }

      


}


