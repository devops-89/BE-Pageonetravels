import { DynamicModule, Module } from '@nestjs/common';
import {  TBO_CredentialsService } from './tbo-config.service';
import { ConfigModule } from 'libs/config/config.module';
import { DBModule } from '../../libs/database/src/database.module';
import { Setting , SettingRepositoryService} from '../../libs/database/src/';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'libs/config/config.service';
import { HotelTBO_CredentialsService } from './hoteltbo-config.service';



@Module({
    imports: [
      ConfigModule, // For ConfigService
      TypeOrmModule.forFeature([Setting]), // Registering the Setting entity
    ],
  })
  export class HotelTBOConfigModule {
    static register(): DynamicModule {
      return {
        module: HotelTBOConfigModule,
        providers: [
          SettingRepositoryService,
          {
            provide: HotelTBO_CredentialsService,
            useFactory: async (
              settingRepository: SettingRepositoryService,
              configService: ConfigService,
            ) => {
              const service = new HotelTBO_CredentialsService(settingRepository, configService);
              await service.getSettingValues(); // Ensure async if needed
              return service;
            },
            inject: [SettingRepositoryService, ConfigService],
          },
        ],
        exports: [HotelTBO_CredentialsService],
      };
    }
  }