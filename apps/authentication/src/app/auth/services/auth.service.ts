/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable no-async-promise-executor */
import { Injectable } from '@nestjs/common';
import { LoginSessionService, OtpVerificationService, User, UserRepositoryService } from '../../../../../../libs/database/src';
import {  LOGIN_BY,  OTP_REQUEST_LIMITS,  OTP_SEND_ON, OTP_TYPE, SESSION_STATUS, USER_ACCOUNT_STATUS, USER_LOGIN_SOURCE, USER_VERIFY_STATUS } from '../../../../../../libs/constants/autenticationConstants/userContants';
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
    private readonly jwtService: JwtService,
    private readonly LoginSessionModel:LoginSessionService,
    private readonly EmailService :EmailService,
   
  
) {}

}
