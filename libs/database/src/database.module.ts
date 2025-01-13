import { Module } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigDatabase } from '../../config/config.interface';
import {
    LoginSessionService,
    OtpVerificationService,
    UserRepositoryService,
    AddressRepositoryService,
    CommissionRepositoryService,
    SettingRepositoryService,
    SearchRepositoryService,
    HeaderRepositoryService,
    BannerRepositoryService,
    TabRepositoryService,
    FestivalRepositoryService,
    OfferRepositoryService,
    TestimonialRepositoryService,
    AboutRepositoryService,
    FaqRepositoryService,
    SocialRepositoryService,
    FooterRepositoryService
 
} from './';
import { User, OtpVerification, LoginSession, Address, Setting,Commission, Airport,Faq,Banner,About,Festival,Offer, Social, Testimonial,Footer,Headers,TabService } from './';

@Module({})
export class DBModule {

    private static getConnectionOptions(config: ConfigService): TypeOrmModuleOptions {
        const dbData = config.get().db;
        if (!dbData) {
            throw Error('');
        }
        const connectionOptions = this.getConnectionOptionsPostgres(dbData);
        return {
            ...connectionOptions,
            entities: [
                User,
                OtpVerification,
                LoginSession,
                Address,
                Commission,
                Setting,
                Airport,
                Faq,Banner,About,Festival,Offer, Social, Testimonial,Footer,Headers,TabService
            ],
            synchronize: true,
            logging: false,
            migrationsRun: false
        };
    }

    private static getConnectionOptionsPostgres(dbData: ConfigDatabase): TypeOrmModuleOptions {
        const { database, entities, host, logging, password, port, synchronize, type, username, url } = dbData;
        // return {url, type:'postgres'}
        
        return {
            database,
            entities,
            host,
            logging,
            password,
            port,
            synchronize,
            type: 'postgres',
            username,
        };
    }

    public static forRoot() {
        return {
            module: DBModule,
            imports: [
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (configService: ConfigService) => {
                        return DBModule.getConnectionOptions(configService);
                    },
                    inject: [ConfigService],
                }),
                TypeOrmModule.forFeature([
                    User,
                    OtpVerification,
                    LoginSession,
                    Address,
                    Commission,
                    Setting,
                    Airport,
                    Faq,Banner,About,Festival,Offer, Social, Testimonial,Footer,Headers,TabService
                ]),
            ],
            controllers: [],
            providers: [
                UserRepositoryService,
                OtpVerificationService,
                LoginSessionService,
                AddressRepositoryService,
                CommissionRepositoryService,
                SettingRepositoryService,
                SearchRepositoryService,
                HeaderRepositoryService,
                BannerRepositoryService,
                TabRepositoryService,
                FestivalRepositoryService,
                OfferRepositoryService,
                TestimonialRepositoryService,
                AboutRepositoryService,
                FaqRepositoryService,
                SocialRepositoryService,
                FooterRepositoryService
               
            ],
            exports: [
                UserRepositoryService,
                OtpVerificationService,
                LoginSessionService,
                AddressRepositoryService,
                CommissionRepositoryService,
                SettingRepositoryService,
                SearchRepositoryService,
                HeaderRepositoryService,
                BannerRepositoryService,
                TabRepositoryService,
                FestivalRepositoryService,
                OfferRepositoryService,
                TestimonialRepositoryService,
                AboutRepositoryService,
                FaqRepositoryService,
                SocialRepositoryService,
                FooterRepositoryService
            ],
        };
    }

}