import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import {  LoginSession, LoginSessionService, User, UserRepositoryService } from '../../../../../libs/database/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionManagerService } from '../../../../../libs/database/src';
import { DefaultUserService } from './services/defaultUserService';
import { DBModule, OtpVerificationService} from '../../../../../libs/database/src';
import { AuthService } from './services/auth.service';
import { LoginService } from './services/login.service';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { OptionalTokenValidationAndGuestMiddleware, TokenValidationAndGuestMiddleware, TokenValidationMiddleware } from '../../../../../libs/middlewares/authMiddleware';
import { ConfigService } from '../../../../../libs/config/config.service';
 import { EmailService } from '../../../../../libs/email-service/email.service';
// import { SmsService } from '../../../../../libs/sms-service/sms.service';

@Module({
  imports: [
    DBModule.forRoot(),
    ConfigModule,
    ResponseHandlerModule,
    TypeOrmModule.forFeature([
      LoginSession,
      User,
      UserRepositoryService,
      PermissionManagerService,
      OtpVerificationService,
      LoginService,
      JwtService,
      LoginSessionService,
      ConfigService,
    ]),
  ],
  providers: [DefaultUserService,EmailService, AuthService, LoginService,  LoginSessionService, JwtService, TokenValidationMiddleware, TokenValidationAndGuestMiddleware, OptionalTokenValidationAndGuestMiddleware],
  controllers: [AuthController],
})
export class AuthModule {}