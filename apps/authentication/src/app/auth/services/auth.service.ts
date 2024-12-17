/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { LoginSessionService, OtpVerificationService, User, UserRepositoryService } from '../../../../../../libs/database/src';
import { LOGIN_BY, OTP_REQUEST_LIMITS, OTP_SEND_ON, OTP_TYPE, SESSION_STATUS, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_VERIFY_STATUS } from '../../../../../../libs/constants/autenticationConstants/userContants';
import { DEVICE_TYPE, ERROR_CODES, TOKEN_TYPE } from '../../../../../../libs/constants/commonConstants';
import { COMMON_MSG, LOGIN_MSG, OTP_VERIFY_MSG, SIGNUP_MSG } from '../../../../../../libs/constants/autenticationConstants/messageConstants';
import { UserI } from '../../../../../../libs/interfaces/authentication/user.interface';
import { ApiResponse } from '../../../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { LoginService } from './login.service';
import { getOTP, getRandomString, validPhoneNo, validateEmail } from '../../../../../../libs/utils/basicUtils';
import { checkPasswordHash, generatePasswordHash } from '../../../utils/bcryptUtil';
import { OtpVerificationI } from '../../../../../../libs/interfaces/authentication/OtpVerification.interface';
import { JWTPayload } from '../../../../../../libs/interfaces/authentication/jwtPayload.interface';
import { JwtService } from '../../../../../../libs/jwt-service/jwt.service';
import { LoginDto, LoginOrRegisterDto, notificationData, RegisterDto, VerifyDto } from '../../../../../../libs/dtos/authentication/user.dto';
import { EmailService } from '../../../../../../libs/email-service/email.service';
// import { SmsService } from '../../../../../../libs/sms-service/sms.service';
import { otpVerificationTemplate } from '../../../../../../libs/templates/otpVerificationTemplate';
import { welcomeEmailTemplate } from '../../.././../../../libs/templates/welcomeEmailTemplate';
import { loginPasswordTemplate } from '../../../../../../libs/templates/loginPasswordTemplate';
import { ForgotPasswardI } from '../../../../../../libs/interfaces/authentication/forgotPassword.interface';
import { resetPassword } from '../../../../../../libs/templates/resetPasswordTemplate';




@Injectable()
export class AuthService {

    constructor(private readonly UserModel: UserRepositoryService,
        private readonly OtpVerificationModel: OtpVerificationService,
        private readonly LoginService: LoginService,
        private readonly jwtService: JwtService,
        private readonly LoginSessionModel: LoginSessionService,
        private readonly EmailService: EmailService,


    ) { }
    async verificationByOtp(input: VerifyDto, deviceType: DEVICE_TYPE): Promise<ApiResponse.ApiOK> {


        try {
            const { reference_id, otp } = input;
            let otpReq = await this.OtpVerificationModel.getVerificationOtpDataByReferenceId(reference_id);
            if (!otpReq) {
                throw { message: 'Invalid request', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.expiryTime < Date.now()) {
                throw { message: 'OTP expired', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.otp !== otp) {
                throw { message: 'Incorrect OTP', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            const user = await this.UserModel.getUnverifiedUserById(otpReq.user);
            if (!user) {
                throw { message: 'User does not exist', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.otpType === OTP_TYPE.REGISTER_OTP) {
                const userStatus: UserI.UpdateUserStatus = {
                    user_id: otpReq.user,
                    status: USER_ACCOUNT_STATUS.ACTIVE,
                    verify_status: USER_VERIFY_STATUS.VERIFIED
                };


                if (otpReq.sendOn === OTP_SEND_ON.EMAIL) {
                    userStatus.is_email_verified = true;


                    if (!user.passwordExist) {
                        const password = getRandomString(8, true, false);
                        const passwordHash = await generatePasswordHash(password);
                        const loginCred = loginPasswordTemplate(password, user.email);
                        await this.EmailService.sendEmail(user.email, 'Login Credentials', loginCred.html);
                        userStatus.password = passwordHash;
                        const welcomeTemplate = welcomeEmailTemplate(user.full_name);
                        await this.EmailService.sendEmail(user.email, 'Welcome to Our Service', welcomeTemplate);
                    }
                } else {
                    userStatus.isPhoneNoVerified = true;
                }

            }

            await this.OtpVerificationModel.removeVerificationOtpDataByReferenceId(reference_id);

            const loginBy: LOGIN_BY = otpReq.sendOn === OTP_SEND_ON.EMAIL ? LOGIN_BY.EMAIL : LOGIN_BY.PHONE;

            const tokenData = {
                loginBy,
                loginIdentity: otpReq.emailOrPhone,
                userId: user.id,
                group: user.user_type,
                deviceType
            };
            const { jwtToken, refresh_token } = await this.LoginService.getLoginToken(tokenData);

            const data = {
                accessToken: jwtToken,
                refresh_token,
                group: user.user_type ? user.user_type : null,
                name: user.full_name,
                email: user.email,
                reference_id: user.id
            };

            return { message: 'OTP verification successful', data };

        } catch (error) {
            console.error("Error in OTP verification:", error);
            throw error;
        }
    }


    async loginWithEmailOrPhone(input: LoginOrRegisterDto): Promise<ApiResponse.ApiOK> {
        try {

            const { country_code, user_type } = input;
            let { identity } = input;

            if (validateEmail(identity)) {
                identity = identity.toLowerCase()

                const emailResult = await this.loginWithEmail({ email: identity, user_type });
                return emailResult;
            } else {
                if (country_code && validPhoneNo(`${country_code}${identity}`)) {
                    const phoneResult = await this.loginWithPhone({ country_code, phone_number: identity, user_type });
                    return phoneResult;
                }
            }

            throw { statusCode: ERROR_CODES.ACCESS_DENIED, message: "Please provide a valid email or phone number" };

        } catch (error) {
            console.error("Error in login with email or phone:", error);
            throw error;
        }
    }

    async loginWithPhone(input: UserI.LoginWithPhone): Promise<ApiResponse.ApiOK> {
        return new Promise(async (resolve, reject) => {
            try {
                const { phone_number, country_code,user_type } = input;
                let userId: string;
                let otpType = OTP_TYPE.LOGIN_OTP;
                // const group = USER_GROUP.USER;
                if ((phone_number && !country_code) || (country_code && !phone_number)) {
                    reject({ statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: COMMON_MSG.PHONE_WTH_COUNTRY_CODE });
                    return;
                }
                const user = await this.UserModel.getUserIdByPhoneNo(phone_number);
                if ((user && user.phone_number == USER_VERIFY_STATUS.UNVERIFIED) || !user)    /// signup using phoneNO
                {
                    const userObj: UserI.AddOrUpdateUser =
                    {
                        phone_number,
                        country_code,
                        // verify_status: USER_VERIFY_STATUS.UNVERIFIED,
                        // loginSource: USER_LOGIN_SOURCE.LOCAL,
                        id: (user && user.phone_number == USER_VERIFY_STATUS.UNVERIFIED) ? user.id : undefined,
                        email: ''
                    }
                    let insertedId = await this.UserModel.addOrUpdateUser(userObj);
                    if (!insertedId) {
                        reject({ message: COMMON_MSG.INVALID_REQUEST, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                        return;
                    }
                    userId = insertedId
                    otpType = OTP_TYPE.REGISTER_OTP
                }
                // else if(user.group == USER_GROUP.SELLER || user.group == USER_GROUP.BUYER)
                // {
                //     reject({ message: "You are not authorised to access the website.", statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
                // else if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                //     reject({ message: COMMON_MSG.BLOCKED_USER, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
                // else if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                //     reject({ message: LOGIN_MSG.INACTIVE_ACCOUNT, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
                else {
                    userId = user.id;
                }
                const currentTime = Date.now();
                const OTP = getOTP()   //6 digit
                const otpObj: OtpVerificationI.VerifyOtpRequest = {
                    otp: OTP,
                    otpType,
                    user: userId,
                    sendOn: OTP_SEND_ON.PHONE,
                    emailOrPhone: phone_number,
                    expiryTime: currentTime + 900000   // 15 min
                }
                const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
                // const msg = `Your Page1Travels Account verification code is: ${OTP}.`
                // const sms = SMSService.getInstance();
                // await sms.sendSMS(msg, "Account Verification", `${countryCode}${phone_no}`);
                // send sms
                resolve({ message: `${OTP_VERIFY_MSG.OTP_SEND} ${phone_number}, OTP: ${OTP}`, data: { referenceId: otpId, OTP } });
                return
            } catch (error) {
                console.log("Error login by phone", error);
                reject(error);
            }
        })
    }


    async loginWithEmail(input: UserI.LoginWithEmail): Promise<ApiResponse.ApiOK> {
        try {
            const { email, user_type } = input;
            let userId: string;
            let otpType = OTP_TYPE.LOGIN_OTP;

            const user = await this.UserModel.getUnverifiedUserByEmail(email);
            if ((user &&  user.phone_number== USER_VERIFY_STATUS.UNVERIFIED) || !user) {
                //const permission = await this.PermissionModel.getPermissionByRoleName({ group });
            


                const userObj: UserI.AddOrUpdateUser = {
                    email,
                    status: USER_ACCOUNT_STATUS.INACTIVE,
                    verify_status: USER_VERIFY_STATUS.UNVERIFIED,
                    loginSource: USER_LOGIN_SOURCE.LOCAL,
                } as UserI.AddOrUpdateUser

                let insertedId = await this.UserModel.addOrUpdateUser(userObj);
                if (!insertedId) {
                    throw { message: COMMON_MSG.INVALID_REQUEST, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
                }
                userId = insertedId;
                otpType = OTP_TYPE.REGISTER_OTP;

                // else if(user.group == USER_GROUP.ADMIN)
                // {
                //     reject({ message: "You are not authorised to access the website.", statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
            } else if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                throw { message: COMMON_MSG.BLOCKED_USER, statusCode: ERROR_CODES.BLOCKED_USER };
            } else if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                throw { message: LOGIN_MSG.INACTIVE_ACCOUNT, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            } else {
                userId = user.id;
            }

            const currentTime = Date.now();
            const OTP = getOTP();

            const otpObj: OtpVerificationI.VerifyOtpRequest = {
                otp: OTP,
                otpType,
                user: userId,
                sendOn: OTP_SEND_ON.EMAIL,
                emailOrPhone: email,
                expiryTime: currentTime + 900000, // 15 min
            };

            const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
            // const emailTemplate = otpVerification(OTP);

            // await this.EmailService.sendEmail(email, 'Account Verification', emailTemplate.html);
            // send email

            const otpEmail = otpVerificationTemplate(OTP, email);
            await this.EmailService.sendEmail(email, 'Your OTP Code', otpEmail.html);

            return { message: `${OTP_VERIFY_MSG.OTP_SEND} ${email}`, data: { referenceId: otpId, OTP } };

        } catch (error) {
            console.error("Error login with email:", error);
            throw error;
        }
    }

}