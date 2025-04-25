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
  BookingRepositoryService,
  OrderRepositoryService,
  FlightTicketRepositoryService,
  Payment,
  HotelCountryRepositoryService,
  HotelCityRepositoryService,
  HotelDetailsRepositoryService, 
  EnquiryRepositoryService,
  Enquiry,

} from './';
import { User, OtpVerification, LoginSession,HotelCountry,HotelDetails, HotelCity ,Address, Setting,Commission, Airport,Booking, TransactionDetail, Passenger, Hotel,Order} from './';
import { TransactionManager } from './repositories/utils';
import { DataSource } from 'typeorm';

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
                Booking,
                TransactionDetail,
                Passenger,
                Hotel,
                Order,
                Payment,
                HotelCountry,
                HotelCity,
                HotelDetails,
                Enquiry
            ],
            synchronize: true,
            logging: false,
            migrationsRun: false
        };
    }

    private static getConnectionOptionsPostgres(dbData: ConfigDatabase): TypeOrmModuleOptions {
        const { database, entities, host, logging, password, port, synchronize, type, username, url } = dbData;
        // return {url, type:'postgres'}
      console.log(">>>>>>>>>>>>d", database);

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
                    Booking,
                    TransactionDetail,
                    Passenger,
                    Hotel,
                    Order,
                    Payment,
                    HotelCountry,
                    HotelCity,
                    HotelDetails,
                    Enquiry
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
                BookingRepositoryService,
                OrderRepositoryService,
                FlightTicketRepositoryService,
                HotelCountryRepositoryService,
                HotelCityRepositoryService,
                HotelDetailsRepositoryService,
                EnquiryRepositoryService,
                {
                    provide: TransactionManager, // Register TransactionManager
                    useFactory: (dataSource: DataSource) => new TransactionManager(dataSource),
                    inject: [DataSource], // Inject DataSource
                  },


            ],
            exports: [
                UserRepositoryService,
                OtpVerificationService,
                LoginSessionService,
                AddressRepositoryService,
                CommissionRepositoryService,
                SettingRepositoryService,
                SearchRepositoryService,
                BookingRepositoryService,
                OrderRepositoryService,
                FlightTicketRepositoryService,
                HotelCountryRepositoryService,
                HotelCityRepositoryService,
                HotelDetailsRepositoryService,
                EnquiryRepositoryService
            ],
        };
    }

}
