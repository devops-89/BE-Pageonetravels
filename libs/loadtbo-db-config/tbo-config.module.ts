import { Module } from '@nestjs/common';
import {  TBO_CredentialsService } from './tbo-config.service';
import { ConfigModule } from 'libs/config/config.module';
import { DBModule } from '../../libs/database/src/database.module';
import { Setting , SettingRepositoryService} from '../../libs/database/src/';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { SettingRepositoryService } from "../../libs/database/src/repositories/setting.repository";


@Module({
    imports:[ConfigModule,
        DBModule,
        TypeOrmModule.forFeature([
            Setting,
            SettingRepositoryService
        ])
    ],
    providers: [TBO_CredentialsService, SettingRepositoryService],
    exports: [TBO_CredentialsService]
})
export class TBOConfigModule {}