/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { LoginSessionService, OtpVerificationService, PermissionManagerService, User, UserRepositoryService } from '../../../../../../libs/database/src';
import {  LOGIN_BY,  OTP_REQUEST_LIMITS,  OTP_SEND_ON, OTP_TYPE, SESSION_STATUS, USER_ACCOUNT_STATUS, USER_GROUP, USER_LOGIN_SOURCE, USER_VERIFY_STATUS } from '../../../../../../libs/constants/autenticationConstants/userContants';
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
import {otpVerificationTemplate} from '../../../../../../libs/templates/otpVerificationTemplate';
// import { newUserInfoTemplate } from '../../.././../../../libs/templates/newUserAdminTemplate';
import { welcomeEmailTemplate } from '../../.././../../../libs/templates/welcomeEmailTemplate';
import { loginPasswordTemplate } from '../../../../../../libs/templates/loginPasswordTemplate';
import { ForgotPasswardI } from '../../../../../../libs/interfaces/authentication/forgotPassword.interface';
import { resetPassword } from '../../../../../../libs/templates/resetPasswordTemplate';




@Injectable()
export class AuthService {
    
  constructor( private readonly UserModel: UserRepositoryService, 
    private readonly OtpVerificationModel: OtpVerificationService,
    private readonly LoginService: LoginService,
    private readonly PermissionModel: PermissionManagerService,
    private readonly jwtService: JwtService,
    private readonly LoginSessionModel:LoginSessionService,
    private readonly EmailService :EmailService,
    // private readonly SmsService :SmsService,
  
) {}

    async verificationByOtp(input: VerifyDto, deviceType: DEVICE_TYPE): Promise<ApiResponse.ApiOK> {
        

        try {
            // Retrieve OTP verification data by referenceId
            const { referenceId, otp } = input;
            const otpReq = await this.OtpVerificationModel.getVerificationOtpDataByReferenceId(referenceId);
            if (!otpReq) {
                throw { message: 'Invalid request', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // Check if OTP has expired
            if (otpReq.expiryTime < Date.now()) {
                throw { message: 'OTP expired', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // Verify the OTP
            if (otpReq.otp !== otp) {
                throw { message: 'Incorrect OTP', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // Retrieve user information
            const user = await this.UserModel.getUnverifiedUserById(otpReq.user);
            if (!user) {
                throw { message: 'User does not exist', statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // Handle OTP verification based on its type
            if (otpReq.otpType === OTP_TYPE.REGISTER_OTP) {
                const userStatus: UserI.UpdateUserStatus = {
                    userId: otpReq.user,
                    status: USER_ACCOUNT_STATUS.ACTIVE,
                    verifyStatus: USER_VERIFY_STATUS.VERIFIED
                };

                // Update user status based on the method of OTP sending
                if (otpReq.sendOn === OTP_SEND_ON.EMAIL) {
                    userStatus.isEmailVerified = true;

                    // Set a password if it doesn't exist and send credentials via email
                    if (!user.passwordExist) {
                        const password = getRandomString(8, true, false);
                        const passwordHash = await generatePasswordHash(password);
                        const loginCred = loginPasswordTemplate(password, user.email);
                        await this.EmailService.sendEmail(user.email, 'Login Credentials', loginCred.html);
                        userStatus.password = passwordHash;
                        const welcomeTemplate = welcomeEmailTemplate(user.name);
                        await this.EmailService.sendEmail(user.email, 'Welcome to Our Service', welcomeTemplate);
                    }
                } else {
                    userStatus.isPhoneNoVerified = true;
                }

                await this.UserModel.updateUserStatus(userStatus);
            }

            // Remove OTP verification data after successful verification
            await this.OtpVerificationModel.removeVerificationOtpDataByReferenceId(referenceId);

            // Determine the login method
            const loginBy: LOGIN_BY = otpReq.sendOn === OTP_SEND_ON.EMAIL ? LOGIN_BY.EMAIL : LOGIN_BY.PHONE;

            // Generate login tokens
            const tokenData = {
                loginBy,
                loginIdentity: otpReq.emailOrPhone,
                permissionId: user.permission,
                roleName: user.roleName,
                userId: user.id,
                group: user.group,
                deviceType
            };
            const { jwtToken, refreshToken } = await this.LoginService.getLoginToken(tokenData);

            // Response data
            const data = {
                accessToken: jwtToken,
                refreshToken,
                group: user.group ? user.group : null,
                name: user.name,
                email: user.email,
                referenceId: user.id
            };

            return { message: 'OTP verification successful', data };

        } catch (error) {
            console.error("Error in OTP verification:", error);
            throw error;
        }
    }

    async loginWithEmailOrPhone(input: LoginOrRegisterDto): Promise<ApiResponse.ApiOK> {
        try {

            const { countryCode, group } = input;
            let { identity } = input;
            
            if (validateEmail(identity)) {
                identity = identity.toLowerCase()

                const emailResult = await this.loginWithEmail({ email: identity, group });
                return emailResult;               
            } else {
                if (countryCode && validPhoneNo(`${countryCode}${identity}`)) {
                    const phoneResult = await this.loginWithPhone({ countryCode, phoneNo: identity, group });
                    return phoneResult;
                }
            }

            throw { statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: "Please provide a valid email or phone number" };

        } catch (error) {
            console.error("Error in login with email or phone:", error);
            throw error;
        }
     }

     loginWithPhone(input: UserI.LoginWithPhone): Promise<ApiResponse.ApiOK>
     {
         return new Promise(async (resolve, reject) => {
             try {
                 const { phoneNo, countryCode, group } = input;
                 let userId: number;
                 let otpType = OTP_TYPE.LOGIN_OTP;
                 // const group = USER_GROUP.USER;
                 if ((phoneNo && !countryCode) || (countryCode && !phoneNo)) {
                     reject({ statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: COMMON_MSG.PHONE_WTH_COUNTRY_CODE });
                     return;
                 }
                 const user = await this.UserModel.getUserIdByPhoneNo(phoneNo);
                 if ((user && user.verifyStatus == USER_VERIFY_STATUS.UNVERIFIED) || !user)    /// signup using phoneNO
                 {
                     const permission = await this.PermissionModel.getPermissionByRoleName({ group });
                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                     const permissionObj: any = {}
                     if (permission) {
                         permissionObj.roleName = permission.roleName
                         permissionObj.group = permission.group
                         permissionObj.permission = permission.id
                     }
                     const userObj: UserI.AddOrUpdateUser =
                     {
                         phoneNo,
                         countryCode,
                         status: USER_ACCOUNT_STATUS.INACTIVE,
                         verifyStatus: USER_VERIFY_STATUS.UNVERIFIED,
                         loginSource: USER_LOGIN_SOURCE.LOCAL,
                         id: (user && user.verifyStatus == USER_VERIFY_STATUS.UNVERIFIED) ? user.id:undefined,
                         ...permissionObj
                     }
                     const insertedId = await this.UserModel.addOrUpdateUser(userObj);
                     if(!insertedId){
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
                 else if (user.status == USER_ACCOUNT_STATUS.BLOCKED) {
                     reject({ message: COMMON_MSG.BLOCKED_USER, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                     return;
                 }
                 else if (user.status != USER_ACCOUNT_STATUS.ACTIVE) {
                     reject({ message: LOGIN_MSG.INACTIVE_ACCOUNT, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER });
                     return;
                 }
                 else
                 {
                     userId = user.id;
                 }
                 const currentTime = Date.now();
                 const OTP =  getOTP()   //6 digit
                 const otpObj: OtpVerificationI.VerifyOtpRequest = {
                     otp: OTP,
                     otpType,
                     user:userId,
                     sendOn: OTP_SEND_ON.PHONE,
                     emailOrPhone: phoneNo,
                     expiryTime: currentTime + 900000   // 15 min
                 }
                 const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
                 // const msg = `Your Bharat Hastkaushal account verification code is: ${OTP}.`
                 // const sms = SMSService.getInstance();
                 // await sms.sendSMS(msg, "Account Verification", `${countryCode}${phoneNo}`);
             // send sms
                 resolve({ message: `${OTP_VERIFY_MSG.OTP_SEND} ${phoneNo}, OTP: ${OTP}`, data: { referenceId: otpId, OTP }  });
                 return
             } catch (error) {
                 console.log("Error login by phone", error);
                 reject(error);
             }
         })
     }
    
    
    async loginWithEmail(input: UserI.LoginWithEmail): Promise<ApiResponse.ApiOK> {
        try {
            const { email, group } = input;
            let userId: number;
            let otpType = OTP_TYPE.LOGIN_OTP;

            const user = await this.UserModel.getUnverifiedUserByEmail(email);
            if ((user && user.verifyStatus == USER_VERIFY_STATUS.UNVERIFIED) || !user) {
                const permission = await this.PermissionModel.getPermissionByRoleName({ group });
                const permissionObj: UserI.PermissionObj = {}
                if (permission) {
                    permissionObj.roleName = permission.roleName;
                    permissionObj.group = permission.group;
                    permissionObj.permission = permission.id;
                }

                const userObj: UserI.AddOrUpdateUser = {
                    email,
                    status: USER_ACCOUNT_STATUS.INACTIVE,
                    verifyStatus: USER_VERIFY_STATUS.UNVERIFIED,
                    loginSource: USER_LOGIN_SOURCE.LOCAL,
                    id: (user && user.verifyStatus == USER_VERIFY_STATUS.UNVERIFIED) ? user.id:undefined,
                    ...permissionObj
                } as UserI.AddOrUpdateUser
    
                const insertedId = await this.UserModel.addOrUpdateUser(userObj);
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

            const otpEmail = otpVerificationTemplate(OTP);
            await this.EmailService.sendEmail(email, 'Your OTP Code', otpEmail.html);

            return { message: `${OTP_VERIFY_MSG.OTP_SEND} ${email}`, data: { referenceId: otpId, OTP } };

        } catch (error) {
            console.error("Error login with email:", error);
            throw error;
        }
    }
    async loginWithPasswordHandler(
        user: User & { permission: number },
        identity: string,
        password: string,
        loginBy: LOGIN_BY
    ): Promise<ApiResponse.ApiOK> {
        try {
           
            if(![USER_GROUP.USER, USER_GROUP.SELLER, USER_GROUP.ADMIN, USER_GROUP.MANAGER].includes(user.group)) {
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


            // Verify password
            const isPasswordCorrect = await checkPasswordHash(password, user.password);
            if (!isPasswordCorrect) {
                throw { 
                    message: LOGIN_MSG.INVALID_CREDENTIALS, 
                    statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER 
                };
            }

            // Generate tokens
            const tokenData = {
                loginBy,
                loginIdentity: identity,
                permissionId: user.permission,
                roleName: user.roleName,
                userId: user.id,
                group: user.group
            };
            const { jwtToken, refreshToken } = await this.LoginService.getLoginToken(tokenData);
    
            // Prepare response data
            const data = {
                accessToken: jwtToken,
                refreshToken,
                group: user.group,
                name: user.name,
                email: user.email,
                referenceId: user.id
            };
    
            return { 
                message: LOGIN_MSG.LOGIN_SUCCESS, 
                data 
            };
            
        } catch (error) {
            console.error("Error in loginWithPasswordHandler:", error);
            throw error; // Re-throw error to be handled by higher-level logic
        }
    }
    async loginWithEmailOrPhonePassword(input: LoginDto,deviceType: string): Promise<ApiResponse.ApiOK> {
        try {
            const { identity, password, countryCode } = input;
    
            if (validateEmail(identity)) {
                const email = identity.toLowerCase();
                const user = await this.UserModel.getUserByEmail(email);
                if (!user) {
                throw {
                        message: LOGIN_MSG.INVALID_EMAIL_PASSWORD,
                        statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER
                    };
                }
    
                return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.EMAIL);
    
            } else {
                if ((identity && !countryCode) || (countryCode && !identity)) {
                    throw {
                        statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER,
                        message: COMMON_MSG.PHONE_WTH_COUNTRY_CODE
                    };
                }
    
                const user = await this.UserModel.getUserByPhoneNo(identity);
    
                if (!user) {
                    throw {
                        message: LOGIN_MSG.INVALID_PHONE_PASSWORD,
                        statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER
                    };
                }
    
                return await this.loginWithPasswordHandler(user, identity, password, LOGIN_BY.PHONE);
            }
        } catch (error) {
            console.error("Error Login with email or phone password:", error);
            throw error; // Re-throw error to be handled by higher-level logic
        }
    }
    
        async registerWithEmailPassword(input: RegisterDto): Promise<ApiResponse.ApiOK> {
        try {
            input.email = input.email.toLowerCase();
            const { email, password, name, group } = input;

            if (!group) {
                input.group = USER_GROUP.USER;
            }

            if (!validateEmail(email)) {
                throw { message: COMMON_MSG.INVALID_EMAIL, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            const checkIfExist = await this.UserModel.checkUserEmailExist(email);
            if (checkIfExist) {
                throw { message: COMMON_MSG.EMAIL_ALREADY_EXIST, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            const passwordHash = await generatePasswordHash(password);
            const permission = await this.PermissionModel.getPermissionByRoleName({ group: input.group });
            if (!permission) {
                throw { message: SIGNUP_MSG.PERMISSION_NOT_FOUND, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const permissionObj: any = {
                roleName: permission.roleName,
                group: permission.roleName,
                permission: permission.id
            };

            const user: UserI.InsertUserByEmail = {
                password: passwordHash,
                email: email.toLowerCase().trim(),
                status: USER_ACCOUNT_STATUS.INACTIVE,
                verifyStatus: USER_VERIFY_STATUS.UNVERIFIED,
                loginSource: USER_LOGIN_SOURCE.LOCAL,
                name,
                ...permissionObj
            };

            const userData = await this.UserModel.addOrUpdateByEmail(user);


            const currentTime = Date.now();

            const OTP = getOTP();

            const otpObj: OtpVerificationI.VerifyOtpRequest = {
                otp: OTP,
                otpType: OTP_TYPE.REGISTER_OTP,
                user: userData.id,
                sendOn: OTP_SEND_ON.EMAIL,
                emailOrPhone: email,
                expiryTime: currentTime + 900000 // 15 min
            };

            const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);

            // Prepare and send the OTP verification email
            const emailTemplate = otpVerificationTemplate(OTP, name);
            await this.EmailService.sendEmail(email, 'Email Verification', emailTemplate.html);

            return { message: `${OTP_VERIFY_MSG.OTP_SEND} ${email}`, data: { referenceId: otpId, OTP, name } };
        } catch (error) {
            console.error("Error registering with email & password:", error);
            throw error;
        }
    }

    async renewAccessToken(input: UserI.RenewAccessToken): Promise<ApiResponse.ApiOK> {
        try {
            const { accessToken, refreshToken } = input;

            if (!accessToken || !refreshToken) {
                throw {
                    message: "Invalid request",
                    statusCode: ERROR_CODES.JWT_TOKEN_INVALID,
                    extraError: "accessToken or refreshToken not found"
                };
            }

            // Verify the current access token
            const { verified, errorCode } = await this.jwtService.verifyJWTToken(accessToken);
            if (verified) {
                return {
                    message: "Login session is still valid",
                    data: { accessToken, refreshToken }
                };
            }

            // Handle expired access token
            if (errorCode === ERROR_CODES.JWT_TOKEN_EXPIRED) {
                const expPayload = this.jwtService.getJWTTokenPayload(accessToken);
                if (!expPayload) {
                    throw {
                        message: "Invalid token payload",
                        statusCode: ERROR_CODES.JWT_TOKEN_INVALID
                    };
                }

                // Get the session associated with the refresh token
                const session = await this.LoginSessionModel.getLoginSessionByRefreshToken(refreshToken, expPayload.sessionId);
                if (session && session.loginStatus === SESSION_STATUS.LOGGED_IN) {
                    // Check if the refresh token is still valid
                    if (refreshToken !== session.refreshToken || session.refreshTokenExpiry < Date.now()) {
                        throw {
                            message: "Login session expired, Please login again",
                            statusCode: ERROR_CODES.JWT_TOKEN_INVALID
                        };
                    }

                    // Generate a new access token
                    const jwtToken = await this.jwtService.generateJWTToken({
                        referenceId: expPayload.referenceId,
                        refreshToken: expPayload.refreshToken,
                        userRole: expPayload.userRole,
                        permissionId: expPayload.permissionId,
                        sessionId: expPayload.sessionId,
                        group: expPayload.group,
                        tokenType: TOKEN_TYPE.USER_LOGIN
                    });

                    return {
                        message: "Token generated successfully",
                        data: { accessToken: jwtToken, refreshToken }
                    };
                } else {
                    throw {
                        message: "User is logged out",
                        statusCode: ERROR_CODES.JWT_TOKEN_INVALID
                    };
                }
            } else if (errorCode === ERROR_CODES.JWT_TOKEN_INVALID) {
                throw {
                    message: "User is logged out",
                    statusCode: ERROR_CODES.JWT_TOKEN_INVALID
                };
            }

        } catch (error) {
            console.log("Error email verification", error);
            throw error;
        }

      }

      async changePassword(input: UserI.ChangePassword, payload: JWTPayload): Promise<ApiResponse.ApiOK> {
        try {
            const { newPassword, oldPassword } = input;

            // Fetch user details by ID
            const user = await this.UserModel.getUserByUserId(payload.referenceId, true);
            if (!user) {
                throw { statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: "No such user found" };
            }

            // Verify old password
            const isPasswordCorrect = await checkPasswordHash(oldPassword, user.password);
            if (!isPasswordCorrect) {
                throw { message: "Old password is incorrect", statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
            }

            // Hash new password and update user profile
            const passwordHash = await generatePasswordHash(newPassword);
            await this.UserModel.updateProfile({ userId: user.id, password: passwordHash });

            const tokenData = {
                loginBy: LOGIN_BY.EMAIL,
                loginIdentity: user.email,
                permissionId: user.permission,
                roleName: user.roleName,
                userId: user.id,
                group: user.group
            };
            const { jwtToken, refreshToken } = await this.LoginService.getLoginToken(tokenData);

            // Return response
            return {
                message: `Password updated successfully...`,
                data: {
                    accessToken: jwtToken,
                    refreshToken,
                    group: user.group || null
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
            throw { message: COMMON_MSG.INVALID_EMAIL, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        const user = await this.UserModel.getUserByEmail(lowercasedEmail);
        if (!user) {
            throw { statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: "User not found" };
        }

        const currentTime = Date.now();
        const OTP = getOTP();

        const otpObj: OtpVerificationI.VerifyOtpRequest = {
            otp: OTP,
            otpType: OTP_TYPE.FORGOT_PASSWORD_OTP,
            retryLeft: 3,
            totalRetry: 3,
            user: user.id,
            sendOn: OTP_SEND_ON.EMAIL,
            resendData: {
                blockedTill: -1,
                isBlocked: false,
                retryLeft: OTP_REQUEST_LIMITS.RESEND_OTP,
                totalRetry: OTP_REQUEST_LIMITS.RESEND_OTP
            },
            emailOrPhone: lowercasedEmail,
            expiryTime: currentTime + 900000 // 15 min
        };

        const otpId = await this.OtpVerificationModel.addOtpVerificationRequest(otpObj);
        const resetTemplate = resetPassword(OTP, user.name);
        await this.EmailService.sendEmail(lowercasedEmail, 'Reset Password', resetTemplate.html);

        return { message: 'OTP has been sent to your registered email', data: { referenceId: otpId } };
    }

    async forgotPasswordVerifyByOtp(input:ForgotPasswardI.ForgotPasswordVerifyByOtp): Promise<ApiResponse.ApiOK> {
        const { referenceId, otp, password } = input;

        const otpReq = await this.OtpVerificationModel.getVerificationOtpDataByReferenceId(Number(referenceId));
        if (!otpReq) {
            throw { message: OTP_VERIFY_MSG.INVALID_REQUEST, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.expiryTime < Date.now()) {
            throw { message: OTP_VERIFY_MSG.OTP_EXPIRE, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.otp !== otp) {
            throw { message: OTP_VERIFY_MSG.INCORRECT_OTP, statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER };
        }

        if (otpReq.otpType === OTP_TYPE.FORGOT_PASSWORD_OTP) {
            const passwordHash = await generatePasswordHash(password);
            await this.UserModel.updatePasswordByUserId({ userId: otpReq.user, password: passwordHash });
        }

        await this.OtpVerificationModel.removeVerificationOtpDataByReferenceId(Number(referenceId));

        return { message: OTP_VERIFY_MSG.PASSWORD_RESET, data: null };
    }
}
