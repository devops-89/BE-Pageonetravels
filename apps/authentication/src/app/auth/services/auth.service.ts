/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { LoginSessionService, OtpVerificationService, User, UserRepositoryService } from '../../../../../../libs/database/src';
import { LOGIN_BY, OTP_REQUEST_LIMITS, OTP_SEND_ON, OTP_TYPE, SESSION_STATUS, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_TYPE, USER_VERIFY_STATUS } from '../../../../../../libs/constants/autenticationConstants/userContants';
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
    async verificationByOtp(input: VerifyDto, device_type: DEVICE_TYPE): Promise<ApiResponse.ApiOK> {


        try {
            const { reference_id, otp } = input;
            const otpReq = await this.OtpVerificationModel.getVerificationOtpDataByReferenceId(reference_id);
            if (!otpReq) {
                throw { message: 'Invalid request', status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.expiry_time < Date.now()) {
                throw { message: 'OTP expired', status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.otp !== otp) {
                throw { message: 'Incorrect OTP', status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            const user = await this.UserModel.getUnverifiedUserById(otpReq.user);
            if (!user) {
                throw { message: 'User does not exist', status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }


            if (otpReq.otp_type === OTP_TYPE.REGISTER_OTP) {
                const userStatus: UserI.UpdateUserStatus = {
                    id: otpReq.user,
                    status: USER_ACCOUNT_STATUS.ACTIVE,
                    verify_status: USER_VERIFY_STATUS.VERIFIED
                };


                if (otpReq.send_on === OTP_SEND_ON.EMAIL) {
                    userStatus.is_email_verified = true;
console.log(">>>>>>>>",userStatus)

                    if (!user.passwordExist) {
                        const password = getRandomString(8, true, false);
                        const password_hash = await generatePasswordHash(password);
                        const loginCred = loginPasswordTemplate(password, user.email);
                        await this.EmailService.sendEmail(user.email, 'Login Credentials', loginCred.html);
                        userStatus.password = password_hash;
                        const welcomeTemplate = welcomeEmailTemplate(user.full_name);
                        await this.EmailService.sendEmail(user.email, 'Welcome to Our Service', welcomeTemplate);
                    }
                } else {
                    userStatus.is_phone_verified = true;
                }
        
                await this.UserModel.addOrUpdateUser(userStatus);
            }

            await this.OtpVerificationModel.removeVerificationOtpDataByReferenceId(reference_id);

            const loginBy: LOGIN_BY = otpReq.send_on === OTP_SEND_ON.EMAIL ? LOGIN_BY.EMAIL : LOGIN_BY.PHONE;

            const token_data = {
                loginBy,
                login_identity: otpReq.email_or_phone,
                user_id: user.id,
                user_type: user.user_type,
                device_type
            };
            const { jwt_token, refresh_token } = await this.LoginService.getLoginToken(token_data);

            const data = {
                access_token: jwt_token,
                refresh_token,
                user_type: user.user_type ? user.user_type : null,
                full_name: user.full_name,
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

            throw { status_code: ERROR_CODES.ACCESS_DENIED, message: "Please provide a valid email or phone number" };

        } catch (error) {
            console.error("Error in login with email or phone:", error);
            throw error;
        }
    }

    async loginWithPhone(input: UserI.LoginWithPhone): Promise<ApiResponse.ApiOK> {
        return new Promise(async (resolve, reject) => {
            try {
                const { phone_number, country_code, user_type } = input;
                let user_id: string;
                let otp_type = OTP_TYPE.LOGIN_OTP;
                // const user_type = USER_GROUP.USER;
                if ((phone_number && !country_code) || (country_code && !phone_number)) {
                    reject({ status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: COMMON_MSG.PHONE_WTH_COUNTRY_CODE });
                    return;
                }
                const user = await this.UserModel.getUserIdByPhoneNo(phone_number);
                if ((user && user.verify_status == USER_VERIFY_STATUS.UNVERIFIED) || !user)    /// signup using phoneNO
                {
                    const userObj: UserI.AddOrUpdateUser =
                    {
                        phone_number,
                        country_code,
                        status: USER_ACCOUNT_STATUS.INACTIVE,
                        verify_status: USER_VERIFY_STATUS.UNVERIFIED,
                        loginSource: USER_LOGIN_SOURCE.LOCAL,
                        id: (user && user.verify_status == USER_VERIFY_STATUS.UNVERIFIED) ? user.id: undefined,
                        email: ''
                    }
                    let insertedId = await this.UserModel.addOrUpdateUser(userObj);
                    if (!insertedId) {
                        reject({ message: COMMON_MSG.INVALID_REQUEST, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                        return;
                    }
                    user_id = insertedId
                    otp_type = OTP_TYPE.REGISTER_OTP
                }
                // else if(user.user_type == USER_TYPE.USER || user.user_type == USER_TYPE.HOTEL)
                // {
                //     reject({ message: "You are not authorised to access the website.", status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
                else if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                    reject({ message: COMMON_MSG.BLOCKED_USER, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                    return;
                }
                else if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                    reject({ message: LOGIN_MSG.INACTIVE_ACCOUNT, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                    return;
                }
                else {
                    user_id = user.id;
                }
                const currentTime = Date.now();
                const OTP = getOTP()   //6 digit
                const otpObj: OtpVerificationI.VerifyOtpRequest = {
                    otp: OTP,
                    otp_type,
                    user:user_id,
                    send_on: OTP_SEND_ON.PHONE,
                    email_or_phone: phone_number,
                    expiry_time: currentTime + 900000   // 15 min
                }
                const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
                // const msg = `Your Page1Travels Account verification code is: ${OTP}.`
                // const sms = SMSService.getInstance();
                // await sms.sendSMS(msg, "Account Verification", `${country_code}${phone_number}`);
                // send sms
                resolve({ message: `${OTP_VERIFY_MSG.OTP_SEND} ${phone_number}, OTP: ${OTP}`, data: { reference_id: otpId, OTP } });
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
            let user_id: string;
            let otp_type = OTP_TYPE.LOGIN_OTP;

            const user = await this.UserModel.getUnverifiedUserByEmail(email);
            if ((user && user.verify_status== USER_VERIFY_STATUS.UNVERIFIED) || !user) {
                //const permission = await this.PermissionModel.getPermissionByRoleName({ group });
                // const permissionObj: UserI.PermissionObj = {}

                const userObj: UserI.AddOrUpdateUser = {
                    email,
                    status: USER_ACCOUNT_STATUS.INACTIVE,
                    verify_status: USER_VERIFY_STATUS.UNVERIFIED,
                    loginSource: USER_LOGIN_SOURCE.LOCAL,
                    user_type: user_type,
                    id: (user && user.verify_status == USER_VERIFY_STATUS.UNVERIFIED) ? user.id:undefined,
                    // ...permissionObj
                } as UserI.AddOrUpdateUser

                let insertedId = await this.UserModel.addOrUpdateUser(userObj);
                if (!insertedId) {
                    throw { message: COMMON_MSG.INVALID_REQUEST, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
                }
                user_id = insertedId;
                otp_type = OTP_TYPE.REGISTER_OTP;

                // else if(user.group == USER_GROUP.ADMIN)
                // {
                //     reject({ message: "You are not authorised to access the website.", status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                //     return;
                // }
            } else if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                throw { message: COMMON_MSG.BLOCKED_USER, status_code: ERROR_CODES.BLOCKED_USER };
            } else if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                throw { message: LOGIN_MSG.INACTIVE_ACCOUNT, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            } else {
                user_id = user.id;
            }

            const currentTime = Date.now();
            const OTP = getOTP();

            const otpObj: OtpVerificationI.VerifyOtpRequest = {
                otp: OTP,
                otp_type,
                user: user_id,
                send_on: OTP_SEND_ON.EMAIL,
                email_or_phone: email,
                expiry_time: currentTime + 900000, // 15 min
            };

            const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
            // const emailTemplate = otpVerification(OTP);

            // await this.EmailService.sendEmail(email, 'Account Verification', emailTemplate.html);
            // send email

            const otpEmail = otpVerificationTemplate(OTP);
            await this.EmailService.sendEmail(email, 'Your OTP Code', otpEmail.html);

            return { message: `${OTP_VERIFY_MSG.OTP_SEND} ${email}`, data: { reference_id: otpId, OTP } };

        } catch (error) {
            console.error("Error login with email:", error);
            throw error;
        }
    }

    async  registerWithEmailPassword(input: RegisterDto): Promise<ApiResponse.ApiOK> {
        try {
            input.email = input.email.toLowerCase();
            const { email, password, full_name, user_type, phone_number, country_code } = input;

            if (!user_type) {
                input.user_type = USER_TYPE.USER;
            }

            if (!validateEmail(email)) {
                throw { message: COMMON_MSG.INVALID_EMAIL, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            const checkIfExist = await this.UserModel.checkUserEmailExist(email);
            if (checkIfExist)   {
                throw ({ status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: COMMON_MSG.EMAIL_ALREADY_EXIST });
            }

            if (phone_number) {
                const isPhoneExist = await this.UserModel.checkPhoneNumberExist(phone_number);
                if (isPhoneExist) {
                    throw {
                        status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER,
                        message: COMMON_MSG.PHONE_ALREADY_EXIST,
                    };
                }
            }
            const password_hash = await generatePasswordHash(password);

            const user: UserI.InsertUserByEmail = {
                password: password_hash,
                email: email.toLowerCase().trim(),
                status: USER_ACCOUNT_STATUS.ACTIVE,
                verify_status: USER_VERIFY_STATUS.UNVERIFIED,
                loginSource: USER_LOGIN_SOURCE.LOCAL,
                full_name,
                user_type,
                phone_number,
                country_code,
            };

            const userData = await this.UserModel.addOrUpdateByEmail(user);


            const currentTime = Date.now();

            const OTP = getOTP();

            const otpObj: OtpVerificationI.VerifyOtpRequest = {
                otp: OTP,
                otp_type: OTP_TYPE.REGISTER_OTP,
                
                user: userData.id,
                send_on: OTP_SEND_ON.EMAIL,
                resendData: {
                    blockedTill: -1,
                    isBlocked: false,
                    retryLeft: OTP_REQUEST_LIMITS.RESEND_OTP,
                    totalRetry: OTP_REQUEST_LIMITS.RESEND_OTP
                },
                email_or_phone: email,
                expiry_time: currentTime + 900000 // 15 min
            };

            const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
            console.log(">>>>>>>>>>", full_name, OTP)
            const emailTemplate = otpVerificationTemplate(full_name, OTP);
            await this.EmailService.sendEmail(email, 'Email Verification', emailTemplate.html);

            return { message: `${OTP_VERIFY_MSG.OTP_SEND} ${email}`, data: { reference_id: otpId, OTP, full_name } };
        } catch (error) {
            console.error("Error registering with email & password:", error);
            throw error;
        }
    }

    async loginWithEmailOrPhonePassword(input: LoginDto,device_type: string): Promise<ApiResponse.ApiOK> {
        try {
            const { identity, password, country_code } = input;
    
            if (validateEmail(identity)) {
                const email = identity.toLowerCase();
                const user = await this.UserModel.getUserByEmail(email);
                if (!user) {
                throw {
                        message: LOGIN_MSG.INVALID_EMAIL_PASSWORD,
                        status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER
                    };
                }
    
                return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.EMAIL);
    
            } else {
                if ((identity && !country_code) || (country_code && !identity)) {
                    throw {
                        status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER,
                        message: COMMON_MSG.PHONE_WTH_COUNTRY_CODE
                    };
                }
    
                const user = await this.UserModel.getUserByPhoneNo(identity);
    
                if (!user) {
                    throw {
                        message: LOGIN_MSG.INVALID_PHONE_PASSWORD,
                        status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER
                    };
                }
    
                return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.PHONE);
            }
        } catch (error) {
            console.error("Error Login with email or phone password:", error);
            throw error;
        }
    }

    async loginWithPasswordHandler(
        user: User,
        identity: string,
        password: string,
        loginBy: LOGIN_BY
    ): Promise<ApiResponse.ApiOK> {
        try {
           
            if(![USER_TYPE.USER, USER_TYPE.USER, USER_TYPE.ADMIN, USER_TYPE.HOTEL].includes(user.user_type)) {
                throw { 
                    message: "You are not authorized to access the website.", 
                    status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            
            if (user.status === USER_ACCOUNT_STATUS.BLOCKED) {
                throw { 
                    message: COMMON_MSG.BLOCKED_USER,
                    status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                throw { 
                    message: LOGIN_MSG.INACTIVE_ACCOUNT, 
                    status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

    
            const isPasswordCorrect = await checkPasswordHash(password, user.password);
            if (!isPasswordCorrect) {
                throw { 
                    message: LOGIN_MSG.INVALID_CREDENTIALS, 
                    status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            const token_data = {
                loginBy,
                login_identity: identity,
                // permissionId: user.permission,
                user_id: user.id,
                user_type: user.user_type
            };
            const { jwt_token, refresh_token } = await this.LoginService.getLoginToken(token_data);
    
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

    
    async renewAccessToken(input: UserI.RenewAccessToken): Promise<ApiResponse.ApiOK> {
        try {
            const { access_token, refresh_token } = input;

            if (!access_token || !refresh_token) {
                throw {
                    message: "Invalid request",
                    status_code: ERROR_CODES.JWT_TOKEN_INVALID,
                    extraError: "access_token or refresh_token not found"
                };
            }

            const { verified, error_code } = await this.jwtService.verifyJWTToken(access_token);
            if (verified) {
                return {
                    message: "Login session is still valid",
                    data: { access_token, refresh_token }
                };
            }

            if (error_code === ERROR_CODES.JWT_TOKEN_EXPIRED) {
                const expPayload = this.jwtService.getJWTTokenPayload(access_token);
                if (!expPayload) {
                    throw {
                        message: "Invalid token payload",
                        status_code: ERROR_CODES.JWT_TOKEN_INVALID
                    };
                }

                
                const session = await this.LoginSessionModel.getLoginSessionByRefreshToken(refresh_token, expPayload.session_id);
                if (session && session.loginStatus === SESSION_STATUS.LOGGED_IN) {
                    
                    if (refresh_token !== session.refresh_token || session.refreshTokenExpiry < Date.now()) {
                        throw {
                            message: "Login session expired, Please login again",
                            status_code: ERROR_CODES.JWT_TOKEN_INVALID
                        };
                    }

                    const jwt_token = await this.jwtService.generateJWTToken({
                        reference_id: expPayload.reference_id,
                        refresh_token: expPayload.refresh_token,
                        // user_role: expPayload.user_role,
                        session_id: expPayload.session_id,
                        user_type: expPayload.user_type,
                        token_type: TOKEN_TYPE.USER_LOGIN
                    });

                    return {
                        message: "Token generated successfully",
                        data: { access_token: jwt_token, refresh_token }
                    };
                } else {
                    throw {
                        message: "User is logged out",
                        status_code: ERROR_CODES.JWT_TOKEN_INVALID
                    };
                }
            } else if (error_code === ERROR_CODES.JWT_TOKEN_INVALID) {
                throw {
                    message: "User is logged out",
                    status_code: ERROR_CODES.JWT_TOKEN_INVALID
                };
            }

        } catch (error) {
            console.log("Error email verification", error);
            throw error;
        }

      }

      async changePassword(input: UserI.ChangePassword, payload: JWTPayload): Promise<ApiResponse.ApiOK> {
        try {
            const { new_password, old_password } = input;


            let user = await this.UserModel.getUserByUserId(payload.reference_id, true);
            if (!user) {
                throw { status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: "No such user found" };
            }

        
            const isPasswordCorrect = await checkPasswordHash(old_password, user.password);
            if (!isPasswordCorrect) {
                throw { message: "Old password is incorrect", status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

           
            const password_hash = await generatePasswordHash(new_password);
            await this.UserModel.updateProfile({ user_id: user.id, password: password_hash });

            const token_data = {
                loginBy: LOGIN_BY.EMAIL,
                login_identity: user.email,
                user_id: user.id,
                user_type: user.user_type
            };
            const { jwt_token, refresh_token } = await this.LoginService.getLoginToken(token_data);

           
            return {
                message: `Password updated successfully...`,
                data: {
                    access_token: jwt_token,
                    refresh_token,
                    user_type: user.user_type || null
                }
            };

        } catch (error) {
            console.error("Error updating password:", error);
            throw error; // Ensure to throw the error for higher-level handling
        }
    }

    

    async forgotPasswordRequest(input: ForgotPasswardI.ForgotPasswardReq): Promise<ApiResponse.ApiOK> {
        const { email } = input;
        const lowercasedEmail = email.toLowerCase();

        if (!validateEmail(lowercasedEmail)) {
            throw { message: COMMON_MSG.INVALID_EMAIL, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        const user = await this.UserModel.getUserByEmail(lowercasedEmail);
        if (!user) {
            throw { status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: "User not found" };
        }

        const currentTime = Date.now();
        const OTP = getOTP();

        const otpObj: OtpVerificationI.VerifyOtpRequest = {
            otp: OTP,
            otp_type: OTP_TYPE.FORGOT_PASSWORD_OTP,
            retryLeft: 3,
            totalRetry: 3,
            user: user.id,
            send_on: OTP_SEND_ON.EMAIL,
            resendData: {
                blockedTill: -1,
                isBlocked: false,
                retryLeft: OTP_REQUEST_LIMITS.RESEND_OTP,
                totalRetry: OTP_REQUEST_LIMITS.RESEND_OTP
            },
            email_or_phone: lowercasedEmail,
            expiry_time: currentTime + 900000 // 15 min
        };

        const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
        const resetTemplate = resetPassword(OTP, user.full_name);
        await this.EmailService.sendEmail(lowercasedEmail, 'Reset Password', resetTemplate.html);

        return { message: 'OTP has been sent to your registered email', data: { reference_id: otpId } };
    }

    async forgotPasswordVerifyByOtp(input:ForgotPasswardI.ForgotPasswordVerifyByOtp): Promise<ApiResponse.ApiOK> {
        const { reference_id, otp, password } = input;

        const otpReq = await this.OtpVerificationModel.getVerificationOtpDataByReferenceId(String(reference_id));
        if (!otpReq) {
            throw { message: OTP_VERIFY_MSG.INVALID_REQUEST, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.expiry_time < Date.now()) {
            throw { message: OTP_VERIFY_MSG.OTP_EXPIRE, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.otp !== otp) {
            throw { message: OTP_VERIFY_MSG.INCORRECT_OTP, status_code: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.otp_type === OTP_TYPE.FORGOT_PASSWORD_OTP) {
            const password_hash = await generatePasswordHash(password);
            await this.UserModel.updatePasswordByUserId({ user_id: otpReq.user, password: password_hash });
        }

        await this.OtpVerificationModel.removeVerificationOtpDataByReferenceId(String(reference_id));

        return { message: OTP_VERIFY_MSG.PASSWORD_RESET, data: null };
    }

    
    
}