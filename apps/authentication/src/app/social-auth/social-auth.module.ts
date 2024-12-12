/* eslint-disable @typescript-eslint/no-unused-vars */
import { Module } from '@nestjs/common';
import { SocialAuthService } from './social-auth.service';
import { SocialAuthController } from './social-auth.controller';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBModule, LoginSession, LoginSessionService, User, UserRepositoryService } from '../../../../../libs/database/src';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';
import { LoginService } from '../auth/services/login.service';
import { GoogleAuthService } from '../../../../../libs/socialAuth/google';
import { ConfigService } from '../../../../../libs/config/config.service';
// import { ResponseHandlerService } from '../../../../../libs/response-handler/response-handler.service';
// import { UserService } from '../user/services/user.service';

@Module({
    imports: [
        DBModule.forRoot(),
        ResponseHandlerModule,
        ConfigModule,
        TypeOrmModule.forFeature([User, LoginSession, UserRepositoryService, LoginSessionService, JwtService, LoginService, ]),
    ],
    providers: [SocialAuthService, GoogleAuthService, UserRepositoryService, JwtService, LoginService, LoginSessionService],
    controllers: [SocialAuthController],
})
export class SocialAuthModule {}
