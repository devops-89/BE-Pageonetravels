import { Injectable } from '@nestjs/common';
import { ConfigData, ConfigDatabase, ConfigS3Bucket, FLIGHTDATA, GoogleAuth, PaypalPaymentGatewayCred, RAZORPAY, SMTP, ServicesPort, TWILIO_SECRETE } from './config.interface';
import { DEFAULT_CONFIG } from './config.default';
import { config } from 'dotenv';
import { url } from 'inspector';
config();

@Injectable()
export class ConfigService {
    private config: ConfigData;
    constructor(data: ConfigData = DEFAULT_CONFIG, 
      // private readonly settingRepo : SettingRepositoryService
    ) {
      this.config = data;
    }

  public loadFromEnv() {
    this.config = this.parseConfigFromEnv(process.env);
  }

  private parseConfigFromEnv(env: NodeJS.ProcessEnv): ConfigData {
    return {
      env: env.NODE_ENV || DEFAULT_CONFIG.env,
      servicePorts: this.parseServicePorts(env, DEFAULT_CONFIG.servicePorts),
      db: this.parseDBConfig(env, DEFAULT_CONFIG.db), 
      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
      JWT_EXPIRY_TIME: parseInt(process.env.JWT_EXPIRY_TIME, 10),  // 60 * 60 * 24 * 5, // 5 days
      logLevel: env.LOG_LEVEL!,
      AUTH_KEY:process.env.AUTH_KEY,
      S3_bucket: this.parseS3Config(env),
      SMTP: this.parseSMTPConfig(env, DEFAULT_CONFIG.SMTP),
      VIN_SECRET: process.env.VIN_SECRET,
      GoogleAuth: this.parseGoogleAuthConfig(env),
      FRONTEND_BASE_URL: process.env.FRONTEND_BASE_URL,
      TWILIO_SECRETE: this.parseTwilioConfig(env),
      FIREBASE_SERVICE_ACCOUNT: env.FIREBASE_SERVICE_ACCOUNT,
      PaypalCredentials:this.parsePaypalConfig(env),
      SERVER_BASE_PATH: process.env.SERVER_BASE_PATH,
      RAZORPAY_CREDENTIAL: this.parseRazorpayConfig(env), 
    };
  }


  private parseDBConfig(env: NodeJS.ProcessEnv, defaultConfig: Readonly<ConfigDatabase> ) {
    return { 
      host: process.env.DB_HOST || "",
      port: Number(process.env.DB_PORT) || 0,
      username: process.env.DB_USERNAME || "",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_DATABASE || "",
      type: 'postgres',
      synchronize: true,
      logging: false,
      entities: [] as any,
    };
  }

  private parseS3Config(env: NodeJS.ProcessEnv): ConfigS3Bucket {
    return {
        access_key_id: env.S3_ACCESS_KEY_ID,
        secret_access_key: env.S3_SECRET_ACCESS_KEY,
        bucket_name: env.S3_BUCKET_NAME,
        region: env.S3_REGION,
    };
  }

  private parseServicePorts( env: NodeJS.ProcessEnv, defaultConfig: Readonly<ServicesPort>): ServicesPort  {
    return {
      authentication: parseInt(env.AUTHENTICATION_PORT, 10) || defaultConfig.authentication,
      flight: parseInt(env.FLIGHT_PORT, 10) || defaultConfig.flight,
      userManagement: parseInt(env.USER_MANAGEMENT) || defaultConfig.userManagement,
      adminpanel: parseInt(env.ADMIN_PANEL) || defaultConfig.adminpanel,
      hotel: parseInt(env.HOTEL_PORT) || defaultConfig.hotel,
      package_service: parseInt(env.PACKAGE_PORT) || defaultConfig.package_service,
      hotel_management: parseInt(env.HOTEL_MANAGEMENT_PORT) || defaultConfig.hotel_management,
      payment_service: parseInt(env.PAYMENT_SERVICE) || defaultConfig.payment_service,
      webhook_service: parseInt(env.WEBHOOK_SERVICE) || defaultConfig.webhook_service,
      utilityService: parseInt(env.UTILITY_SERVICE) || defaultConfig.utilityService
    };
  }

  private parseSMTPConfig(env: NodeJS.ProcessEnv, defaultConfig: Readonly<SMTP>): SMTP  {
    return {
      SERVICE: "gmail",
      HOST: env.SMTP_HOST || "",
      PORT: parseInt(env.SMTP_PORT || "587"),
      USERNAME: env.SMTP_USERNAME,
      PASSWORD: env.SMTP_PASSWORD,
      SENDER: env.SMTP_SENDER,
      SMTP_TLS: env.SMTP_TLS
    };
  }

  private parseGoogleAuthConfig(env: NodeJS.ProcessEnv): GoogleAuth {
    return {
        GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET
    };
  }

  private parsePaypalConfig(env: NodeJS.ProcessEnv): PaypalPaymentGatewayCred {
    return {
      PAYPAL_MODE:env.PAYPAL_MODE,
      PAYPAL_CLIENT_ID: env.PAYPAL_CLIENT_ID,
      PAYPAL_CLIENT_SECRET: env.PAYPAL_CLIENT_SECRET
    };
  }

  private parseRazorpayConfig(env: NodeJS.ProcessEnv): RAZORPAY {
    return {
      RAZORPAY_KEY:env.RAZORPAY_KEY,
      RAZORPAY_KEY_SECRET: env.RAZORPAY_KEY_SECRET,
      RAZORPAY_WEBHOOK_SECRET: env.RAZORPAY_WEBHOOK_SECRET,
      CREATE_PAYMENT_LINK: env.CREATE_PAYMENT_LINK
    };
  }

  private parseTwilioConfig(env: NodeJS.ProcessEnv): TWILIO_SECRETE {
    return {
        SERVICE_ID: env.SERVICE_ID,
        TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
        TWILIO_PHONE_NUMBER: env.TWILIO_PHONE_NUMBER
    };
  }
  
  public get(): Readonly<ConfigData> {
    return this.config;
  }

  setTBOConfig(flightData:FLIGHTDATA){ 
    // if (!this.config) {
    //   this.config = {}; // Ensure the config object exists
    // }
  
    this.config.TBO_CREDENTIALS = { ...flightData }; // Shallow copy to avoid direct reference
  }
}