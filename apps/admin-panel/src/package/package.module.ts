import { Module } from '@nestjs/common';

import { ConfigModule } from '../../../../libs/config/config.module';
import { PackageController } from './package.controller';
import { PackageService } from './package.services';
import { ResponseHandlerModule } from '../../../../libs/response-handler/response-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { TransactionManager } from '../../../../libs/database/src/repositories/utils';
import { JwtService } from '../../../../libs/jwt-service/jwt.service';
import { TokenValidationMiddleware } from '../../../../libs/middlewares/authMiddleware';
import { DBModule, User, UserRepositoryService } from '../../../../libs/database/src';


@Module({
    imports: [
        DBModule.forRoot(),
        TypeOrmModule.forFeature([
             User,
             TransactionManager,
             UserRepositoryService
        ]),
        ConfigModule,
        ResponseHandlerModule,  
    ],
    controllers: [PackageController],
    providers: [ TransactionManager,PackageService,UserRepositoryService, JwtService, TokenValidationMiddleware],
})


export class PackageModule {} 
