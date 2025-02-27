import { Inject, Module } from "@nestjs/common";
import { ConfigModule } from "../config/config.module";
import { ConfigService } from "../config/config.service";
import { config } from 'aws-sdk';
import { S3FileService } from "./s3File.service";
import { ConfigS3Bucket } from "../config/config.interface";

@Module({
    // imports: [ConfigModule],
 })
export class S3Module {

    public static s3Configure(configData: ConfigS3Bucket)
    {
        const {access_key_id,region,secret_access_key } = configData
        config.update({
            accessKeyId: access_key_id,
            secretAccessKey: secret_access_key,
            region:region,
          });
    }

    public static forRoot() {
        return {
            module: S3Module,
            imports: [ConfigModule],
            providers: [
                {
                    // imports: [ConfigModule],
                    provide: S3FileService,
                    useFactory: (configService1: ConfigS3Bucket) => {
                        const config= new ConfigService()
                        config.loadFromEnv()
                        return S3Module.s3Configure(config.get().S3_bucket)
                    },
                    Inject: [],
                },
            ],
            controllers: [],
            exports: [S3FileService],
        };
    }
}