import { Module } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ConfigModule } from '../../config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigDatabase } from '../../config/config.interface';
import { HotelPaymentRepositoryService } from './repositories/hotelPayment.repository';
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
    // HotelierRepositoryService,
    HotelDetailsRepositoryService,
    HotelRoomTypes,
    // InventoryService,
    HotelierRoomTypesRepositoryService,
    EnquiryRepositoryService,
    Enquiry,
    Package,
    PackageAmenite,
    PackageCategory,
    PackageDay,
    About,
    Banner,
    Faq,
    Festival,
    Footer,
    Offer,
    Social,
    TabService,
    Testimonial,
    RoomInventory,
    HotelierBooking,
    HotelierInventoryRepositoryService,
    HotelierRepositoryService,
    PackageBookingRepositoryService,
    PackageBooking,


} from './';
import { User, OtpVerification, LoginSession, HotelCountry, HotelDetails, HotelCity, Address, Setting, Commission, Airport, Booking, TransactionDetail, Passenger, Hotel, Order } from './';
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
                About,
                Banner,
                Commission,
                Setting,
                Airport,
                Headers,
                TabService,
                TransactionDetail,
                Passenger,
                Hotel,
                Faq,
                Offer,
                Social,
                Festival,
                Testimonial,
                Order,
                Payment,
                HotelCountry,
                HotelCity,
                HotelDetails,
                Enquiry,
                HotelRoomTypes,
                Footer,
                Package,
                PackageAmenite,
                PackageCategory,
                PackageDay,
                HotelierBooking,
                Hotel,
                RoomInventory,
                PackageBooking,
                Booking,
            ],
            synchronize: true,
            logging: false,
            migrationsRun: false,
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
                    About,
                    Banner,
                    Airport,
                    Booking,
                    TransactionDetail,
                    Passenger,
                    Faq,
                    Social,
                    Festival,
                    Footer,
                    Hotel,
                    TabService,
                    Order,
                    Headers,
                    Testimonial,
                    Offer,
                    Payment,
                    HotelCountry,
                    HotelCity,
                    HotelDetails,
                    Enquiry,
                    HotelRoomTypes,
                    Package,
                    PackageAmenite,
                    PackageCategory,
                    PackageDay,
                    RoomInventory,
                    HotelierBooking,
                    PackageBooking,
                    Booking,
                    //HotelierRepositoryService, // Uncomment if needed
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
                HotelPaymentRepositoryService,
                HotelCountryRepositoryService,
                HotelCityRepositoryService,
                HotelDetailsRepositoryService,
                HotelierRepositoryService,
                PackageBookingRepositoryService,
                BookingRepositoryService,
                // InventoryService,
                HotelierRoomTypesRepositoryService,
                HotelierInventoryRepositoryService,
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
                HotelPaymentRepositoryService,
                HotelCountryRepositoryService,
                HotelCityRepositoryService,
                HotelDetailsRepositoryService,
                HotelierRepositoryService,
                //InventoryService,
                HotelierRoomTypesRepositoryService,
                EnquiryRepositoryService,
                HotelierInventoryRepositoryService,
                PackageBookingRepositoryService,
                BookingRepositoryService
            ],
        };
    }
}