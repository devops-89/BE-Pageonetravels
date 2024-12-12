import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../../../../libs/database/src/entities/user.entity';
import { DBModule, LoginSession, LoginSessionService, UserRepositoryService } from '../../../../../libs/database/src';
import { UserController } from './user.controller';
import { ResponseHandlerModule } from '../../../../../libs/response-handler/response-handler.module'; // Adjust path as needed
import { UserService } from './user.service';
import { ConfigModule } from '../../../../../libs/config/config.module';
import { TokenValidationMiddleware } from '../../../../../libs/middlewares/authMiddleware';
import { checkIfAdmin } from '../../../../../libs/middlewares/authMiddleware';
import { JwtService } from '../../../../../libs/jwt-service/jwt.service';
import { S3FileService } from '../../../../../libs/S3-Service/s3File.service';
import { S3Module } from '../../../../../libs/S3-Service/s3.module';



@Module({
  imports: [
    DBModule.forRoot(), 
    ConfigModule,
    S3Module,
    TypeOrmModule.forFeature([User,LoginSession, UserRepositoryService,LoginSessionService],),
    ResponseHandlerModule
  ],
  controllers: [UserController],
  providers: [UserService, UserRepositoryService,TokenValidationMiddleware,S3FileService,checkIfAdmin,JwtService,LoginSessionService,],
})
export class UserModule { }
