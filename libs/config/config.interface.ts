/**
 * Configuration for the database connection.
 */
export interface ConfigDatabase {
  host: string,
  port: number,
  username: string,
  password: string,
  database: string,
  type: string,
  synchronize: boolean,
  logging: boolean,
  url?: string,
  entities: any[]//[path.join(__dirname, '**', '*.entity.{ts,js}')]
}

export interface ConfigS3Bucket {
    access_key_id: string;
    secret_access_key: string;
    region: string;
    bucket_name: string;
}

export interface ConfigAuthorizationData {
  baseUrl: string;
  serviceClientToken: string;
}

export interface ServicesPort {
  authentication: number;
  flight: number;
  userManagement: number
  adminpanel: number
}

export interface SMTP  {
  SERVICE: "gmail",
  HOST: string,
  PORT: number,
  USERNAME: string,
  PASSWORD: string,
  SENDER: string,
  SMTP_TLS: string
}

export interface GoogleAuth
{
  GOOGLE_CLIENT_ID: string,
  GOOGLE_CLIENT_SECRET: string,
}
export interface PaypalPaymentGatewayCred
{
  PAYPAL_MODE:string,
  PAYPAL_CLIENT_ID: string,
  PAYPAL_CLIENT_SECRET: string,
}

export interface TWILIO_SECRETE 
{
    TWILIO_ACCOUNT_SID: string;
    TWILIO_AUTH_TOKEN: string;
    SERVICE_ID: string;
    TWILIO_PHONE_NUMBER: string;
}
export interface RAZORPAY 
{
  RAZORPAY_KEY: string;
  RAZORPAY_KEY_SECRET: string;
}

/**
 * Configuration data for the app.
 */
export interface ConfigData {
  /**
   * The name of the environment.
   * @example 'production'
   */
  env: string;
  AUTH_KEY : string;
  servicePorts : ServicesPort

  /** Database connection details. */
  db: ConfigDatabase;
  JWT_SECRET_KEY: string;
  JWT_EXPIRY_TIME: number;
  S3_bucket: ConfigS3Bucket;
  GoogleAuth: GoogleAuth;

  /**
   * The log level to use.
   * @example 'verbose', 'info', 'warn', 'error'
   */
  logLevel: string;
  SMTP:SMTP,
  VIN_SECRET : string
  FRONTEND_BASE_URL: string
  SERVER_BASE_PATH: string
  TWILIO_SECRETE: TWILIO_SECRETE
  FIREBASE_SERVICE_ACCOUNT:string,
  PaypalCredentials :PaypalPaymentGatewayCred
  RAZORPAY_CREDENTIAL :RAZORPAY
  TBO_CREDENTIALS?: FLIGHTDATA
}

export interface FLIGHTDATA {
  FLIGHT_AUTHENTICATION : string
  FLIGHT_SEARCH : string
  FLIGHT_FARERULE : string
  FLIGHT_FAREQUOTE : string
  FLIGHT_BOOKING_API_FORNONLCC : string
  FLIGHT_TICKET_FORLCC : string
  FLIGHT_BOOKING_DETAILS : string
  FLIGHT_CALENDER_DETAILS : string
  FLIGHT_CLIENT_ID :  string
  FLIGHT_USERNAME :  string
  FLIGHT_PASSWORD : string
  FLIGHT_ENDUSERIP : string,
  HOTEL_SEARCH: string;
  HOTEL_INFO: string;
  HOTEL_ROOM_INFO: string;
  HOTEL_BLOCK_ROOM: string;
  HOTEL_BOOK: string;
  HOTEL_BOOKING_DETAILS: string;
  GET_HOTELSTATICDATA: string;
}
