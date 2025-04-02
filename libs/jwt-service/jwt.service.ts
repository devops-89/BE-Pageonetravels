/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ERROR_CODES, ErrorMessages } from '../constants/commonConstants';
// import { serverConfig } from '../../../serverConfig/environment.config';
import { JWTPayload, JWTPayloadForGuest, VerifyJWTTokenResult } from '../interfaces/authentication/jwtPayload.interface';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtService {
    constructor(private configService: ConfigService){}
    
  private getJWTTokenInfo() {
    
    const expiryTimeInSecs = this.configService.get().JWT_EXPIRY_TIME;
    const JWTSecretKey = this.configService.get().JWT_SECRET_KEY;
    if (!JWTSecretKey) {
      throw new Error('JWT secret-key not provided');
    }

    return { expiryTimeInSecs, JWTSecretKey };
  }

  public generateJWTToken(payload: Partial<JWTPayload>): Promise<string> {
    return new Promise((resolve, reject) => { 
      const { expiryTimeInSecs, JWTSecretKey } = this.getJWTTokenInfo();

      jwt.sign(payload, Buffer.from(JWTSecretKey, 'base64'), { expiresIn: expiryTimeInSecs, algorithm: 'HS512' }, function (err: any, token: string | PromiseLike<string>) {
        if (err || !token) { 
          reject({ statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: 'Error while creating JWT token', extraError: err });
          return;
        } else {
          resolve(token);   
          return;
        }
      });
    });
  }

  public generateGuestJWTToken(payload: Partial<JWTPayloadForGuest>): Promise<string> {
    return new Promise((resolve, reject) => {
      const { expiryTimeInSecs, JWTSecretKey } = this.getJWTTokenInfo();

      jwt.sign(payload, Buffer.from(JWTSecretKey, 'base64'), { expiresIn: expiryTimeInSecs, algorithm: 'HS512' }, function (err: any, token: string | PromiseLike<string>) {
        if (err || !token) {
          reject({ statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: 'Error while creating JWT token', extraError: err });
          return;
        } else {
          resolve(token);
          return;
        }
      });
    });
  }

  public generateJWTNeverExpToken(payload: Partial<JWTPayload>): Promise<string> {
    return new Promise((resolve, reject) => {
      const { expiryTimeInSecs, JWTSecretKey } = this.getJWTTokenInfo();

      jwt.sign(payload, Buffer.from(JWTSecretKey, 'base64'), { algorithm: 'HS512' }, function (err: any, token: string | PromiseLike<string>) {
        if (err || !token) {
          reject({ statusCode: ERROR_CODES.ERROR_UNKNOWN_SHOW_TO_USER, message: 'Error while creating JWT token', extraError: err });
          return;
        } else {
          resolve(token);
          return;
        }
      });
    });
  }

  public verifyJWTToken(token: string | null): Promise<VerifyJWTTokenResult> {
    return new Promise((resolve) => {
      if (!token) {
        resolve({ verified: false, error_code: ERROR_CODES.NOT_AUTHORIZED, error_message: ErrorMessages.NOT_AUTHORIZED, payload: null });
        return;
      }

      const { JWTSecretKey } = this.getJWTTokenInfo();

      jwt.verify(token, Buffer.from(JWTSecretKey, 'base64'), { algorithms: ['HS512'] }, function (err, payload: any) {
        if (err || !payload) {
          if (err && err instanceof jwt.TokenExpiredError) {
            resolve({ verified: false, error_code: ERROR_CODES.JWT_TOKEN_EXPIRED, error_message: ErrorMessages.JWT_TOKEN_EXPIRED, payload: null });
            return;
          } else {
            resolve({ verified: false, error_code: ERROR_CODES.JWT_TOKEN_INVALID, error_message: ErrorMessages.JWT_TOKEN_INVALID, payload: null });
            return;
          }
        } else {
          resolve({ verified: true, payload, error_code: 0, error_message: null });
          return;
        }
      });
    });
  }

  public getJWTTokenPayload(token: string): JWTPayload | null {
    if (!token) {
      return null;
    }

    const payload = jwt.decode(token) as JWTPayload;
    return payload;
  }
}
