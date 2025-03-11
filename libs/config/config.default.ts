import { ConfigData } from './config.interface';

export const DEFAULT_CONFIG: ConfigData = {
    env: 'production',
    db: {
        host: '',
        port: 0,
        username: '',
        password: '',
        database: '',
        type: 'postgres',
        synchronize: true,
        logging: false,
        entities: [],
    },
    logLevel: 'info',
    JWT_SECRET_KEY: '',
    JWT_EXPIRY_TIME: 0,
    AUTH_KEY: '',
    servicePorts: {
        adminpanel: 3005,
        flight: 3001,
        userManagement: 3002,
        authentication: 3000,
        hotel: 3003,
        package_service:3007,
        hotel_management:3008,
    },
    S3_bucket: { access_key_id: '', bucket_name: '', region: '', secret_access_key: '' },
    SMTP: { HOST: '', PASSWORD: '', PORT: 587, SENDER: '', SERVICE: 'gmail', SMTP_TLS: '', USERNAME: '' },
    GoogleAuth: { GOOGLE_CLIENT_ID: '', GOOGLE_CLIENT_SECRET: '' },
    VIN_SECRET: '',
    FRONTEND_BASE_URL: '',
    SERVER_BASE_PATH: '',
    TWILIO_SECRETE:{
        TWILIO_ACCOUNT_SID: '',
        TWILIO_AUTH_TOKEN: '',
        SERVICE_ID: '',
        TWILIO_PHONE_NUMBER: ''
    },
    FIREBASE_SERVICE_ACCOUNT: '',
    PaypalCredentials: { PAYPAL_MODE: '', PAYPAL_CLIENT_ID: '', PAYPAL_CLIENT_SECRET: ''},
    RAZORPAY_CREDENTIAL: { RAZORPAY_KEY: '', RAZORPAY_KEY_SECRET: ''},
    TBO_CREDENTIALS: {
        FLIGHT_AUTHENTICATION : '',
        FLIGHT_SEARCH : '',
        FLIGHT_FARERULE : '',
        FLIGHT_FAREQUOTE : '',
        FLIGHT_SSR : '',
        FLIGHT_BOOKING_API_FORNONLCC : '',
        FLIGHT_TICKET_FORLCC : '',
        FLIGHT_BOOKING_DETAILS : '',
        FLIGHT_CALENDER_DETAILS : '',
      
      
        FLIGHT_CLIENT_ID :  '',
        FLIGHT_USERNAME :  '',
        FLIGHT_PASSWORD : '',
        FLIGHT_ENDUSERIP : '',

        HOTEL_SEARCH: '',
        HOTEL_INFO: '',
        HOTEL_ROOM_INFO: '',
        HOTEL_BLOCK_ROOM: '',
        HOTEL_BOOK: '',
        HOTEL_BOOKING_DETAILS: '',
        GET_HOTELSTATICDATA: '',
        COUNTRY_SEARCH :  '',
        CITY_SEARCH :   ''
    }
};
