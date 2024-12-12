import { Module } from '@nestjs/common';
import { LogoutController } from './logout.controller';
import { LogoutService } from './logout.service';
import { DBModule, LoginSession, LoginSessionService, OtpVerificationService, PermissionManagerService, User, UserRepositoryService } from '../../../../../libs/database/src';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginService } from '../auth/services/login.service';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';
// import { UserService } from '../user/services/user.service';
import { TokenValidationMiddleware } from '../../../../../libs/middlewares/authMiddleware';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
//import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
import { ConfigService } from 'aws-sdk';
import { SocialAuthService } from '../social-auth/social-auth.service';
import { GoogleAuthService } from '../../../../../libs/socialAuth/google';

@Module({
  imports: [
    DBModule.forRoot(),
    ConfigModule,
    ResponseHandlerModule,
    TypeOrmModule.forFeature([
      UserRepositoryService,
      User,
      LoginSession,
      PermissionManagerService,
      OtpVerificationService,
      LoginService,
      JwtService,
      LoginSessionService,
      ConfigService,
      ConfigModule,
      //  ResponseHandlerService,
    ]),
  ],
  controllers: [LogoutController],
  providers: [LogoutService, JwtService, TokenValidationMiddleware,SocialAuthService, GoogleAuthService, UserRepositoryService, JwtService, LoginService, LoginSessionService]
})
export class LogoutModule {}
