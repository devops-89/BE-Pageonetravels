// libs/s3/s3.module.ts
import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { config as AWSConfig } from 'aws-sdk';
import { S3FileService } from './s3File.service';

@Module({})
export class S3Module {
  static forRoot(): DynamicModule {
    return {
      module: S3Module,
      imports: [ConfigModule],
      providers: [
        S3FileService,
        {
          provide: 'S3_INIT',
          useFactory: (configService: ConfigService) => {
            const s3Config = configService.get().S3_bucket;
            AWSConfig.update({
              accessKeyId: s3Config.access_key_id,
              secretAccessKey: s3Config.secret_access_key,
              region: s3Config.region,
            });
          },
          inject: [ConfigService],
        },
      ],
      exports: [S3FileService],
    };
  }
}
