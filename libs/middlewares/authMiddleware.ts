import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express'; 
import { ApiResponse } from '../interfaces/commonTypes/apiResponse.interface';
import { ERROR_CODES, ErrorMessages, TOKEN_TYPE } from '../constants/commonConstants';
import { JwtService } from '../jwt-service/jwt.service';
import { LoginSessionService } from '../database/src';
import { ResponseHandlerService } from '../response-handler/response-handler.service';
import { JWTPayload } from '../interfaces/authentication/jwtPayload.interface';
import { SESSION_STATUS, USER_TYPE } from '../constants/autenticationConstants/userContants';
import { ConfigService } from '../config/config.service';
import { COMMON_MSG } from '../constants/autenticationConstants/messageConstants';

// interface NestMiddlewareExtended
// {
//   use(req: Request, res: Response, token_type: TOKEN_TYPE, next: (error?: Error | any) => void): any;
// }

@Injectable()
export class TokenValidationMiddleware implements NestMiddleware
{
    constructor(private jwtService: JwtService, private LoginSessionModel:LoginSessionService, private readonly ResponseHandler: ResponseHandlerService){}

  async use(req: Request, res: Response, next: NextFunction) {
    const errorResponse: ApiResponse.ApiErrorType = {
        status_code: ERROR_CODES.JWT_TOKEN_INVALID, message: ErrorMessages.JWT_TOKEN_INVALID, extraError: '', name: ''
      };
  
      try 
      {
        console.log(JSON.stringify(req.headers));
        const access_token = req.headers['accesstoken'] as string || null;
        const { verified, payload, error_code, error_message } = await this.jwtService.verifyJWTToken(access_token);
        if (verified && payload) 
        {

          if (payload.token_type != TOKEN_TYPE.USER_LOGIN) 
          {
              this.ResponseHandler.sendErrorResponse(res, errorResponse);
          }
          else
          {
          const loginSession = await this.LoginSessionModel.getLoginSession(payload.session_id);
          if (loginSession && loginSession.loginStatus == SESSION_STATUS.LOGGED_IN) 
          {
              req['userPayload'] = payload;
              next();
          } else if (loginSession && loginSession.loginStatus == SESSION_STATUS.BLOCKED) 
          {
              errorResponse.status_code = ERROR_CODES.BLOCKED_USER;
              errorResponse.message = COMMON_MSG.BLOCKED_USER;
              this.ResponseHandler.sendErrorResponse(res, errorResponse);
          } else 
          {
              errorResponse.status_code = ERROR_CODES.NOT_AUTHORIZED;
              errorResponse.message = ErrorMessages.NOT_AUTHORIZED;
              this.ResponseHandler.sendErrorResponse(res, errorResponse);
          }
        }
        }
        else 
        {
          errorResponse.status_code = error_code;
          errorResponse.message = error_message as string;
          this.ResponseHandler.sendErrorResponse(res, errorResponse)
        }
      } 
      catch (error) 
      {
        errorResponse.extraError = error;
        this.ResponseHandler.sendErrorResponse(res, errorResponse)
      }
  }
}

@Injectable()
export class TokenValidationAndGuestMiddleware implements NestMiddleware {

    constructor(private jwtService: JwtService, private LoginSessionModel:LoginSessionService, private readonly ResponseHandler: ResponseHandlerService){}

  async use(req: Request, res: Response, next: NextFunction) {
    const errorResponse: ApiResponse.ApiErrorType = {
        status_code: ERROR_CODES.JWT_TOKEN_INVALID, message: ErrorMessages.JWT_TOKEN_INVALID, extraError: '', name: ''
      };
  
      try 
      {
        const access_token = req.headers['accesstoken'] as string || null;
        if (access_token == "null" || !access_token) {
            next();
        }
        else
        {
        const { verified, payload, error_code, error_message } = await this.jwtService.verifyJWTToken(access_token);
        if (verified && payload) 
        {

          if (payload.token_type && payload.token_type == TOKEN_TYPE.GUEST_LOGIN) 
          {
              req['userPayload'] = payload;
              next();
          } 
          else if (payload.token_type && payload.token_type == TOKEN_TYPE.USER_LOGIN) 
          {
              const loginSession = await this.LoginSessionModel.getLoginSession(payload.session_id);
              if (loginSession && loginSession.loginStatus == SESSION_STATUS.LOGGED_IN) 
              {
                  req['userPayload'] = payload;
                  next();
              } 
              else if (loginSession && loginSession.loginStatus == SESSION_STATUS.BLOCKED) 
              {
                  errorResponse.status_code = ERROR_CODES.BLOCKED_USER;
                  errorResponse.message = COMMON_MSG.BLOCKED_USER;
                  this.ResponseHandler.sendErrorResponse(res, errorResponse);
              } else 
              {
                  errorResponse.status_code = ERROR_CODES.NOT_AUTHORIZED;
                  errorResponse.message = ErrorMessages.NOT_AUTHORIZED;
                  this.ResponseHandler.sendErrorResponse(res, errorResponse);
              }
          } 
          else {
              errorResponse.status_code = ERROR_CODES.NOT_AUTHORIZED;
              errorResponse.message = ErrorMessages.NOT_AUTHORIZED;
              this.ResponseHandler.sendErrorResponse(res, errorResponse);
          }
        }
        else 
        {
          errorResponse.status_code = error_code;
          errorResponse.message = error_message as string;
          this.ResponseHandler.sendErrorResponse(res, errorResponse)
        }
      }

      } 
      catch (error) 
      {
        errorResponse.extraError = error;
        this.ResponseHandler.sendErrorResponse(res, errorResponse)
      }
  }
}

@Injectable()
export class OptionalTokenValidationAndGuestMiddleware implements NestMiddleware {

    constructor(private jwtService: JwtService, private LoginSessionModel:LoginSessionService, private readonly ResponseHandler: ResponseHandlerService){}

  async use(req: Request, res: Response, next: NextFunction) {
    const errorResponse: ApiResponse.ApiErrorType = {
        status_code: ERROR_CODES.JWT_TOKEN_INVALID, message: ErrorMessages.JWT_TOKEN_INVALID, extraError: '', name: ''
      };
  
      try 
      {
        const access_token = (req.headers['accesstoken'] as string) || null;
        if (!access_token) {
            next();
        }
        else 
        {
            const { verified, payload, error_code, error_message } = await this.jwtService.verifyJWTToken(access_token);
            if (verified && payload) {
                if (payload.token_type && payload.token_type == TOKEN_TYPE.GUEST_LOGIN) {
                    req['userPayload'] = payload;
                }
            } 
            next();
        }
      } 
      catch (error) 
      {
        errorResponse.extraError = error;
        this.ResponseHandler.sendErrorResponse(res, errorResponse)
      }
  }
}

@Injectable()
export class KeyValidationMiddleware implements NestMiddleware {
    constructor(private readonly ResponseHandler: ResponseHandlerService, private configService: ConfigService){}

  use(req: Request, res: Response, next: NextFunction) {

    const errorResponse: ApiResponse.ApiErrorType = {
            status_code: ERROR_CODES.ACCESS_DENIED, message: ErrorMessages.NOT_AUTHORIZED, name: ""
          };

          if ( this.configService.get().AUTH_KEY != req.headers.authKey) {
            this.ResponseHandler.sendErrorResponse(res, errorResponse)
          }
          else
            next();
  }
}

@Injectable()
export class checkIfAdmin implements NestMiddleware {
    constructor(private readonly ResponseHandler: ResponseHandlerService){}
  use(req: Request, res: Response, next: NextFunction) {

    const errorResponse: ApiResponse.ApiErrorType = {
            status_code: ERROR_CODES.ACCESS_DENIED, message: ErrorMessages.NOT_AUTHORIZED, name: ""
          };
        
          const payload: JWTPayload = req['userPayload'];
          if (payload.user_type != USER_TYPE.ADMIN) {
            this.ResponseHandler.sendErrorResponse(res, errorResponse)
          }
          else
             next();
  }
}


@Injectable()
export class checkIfAdminUser implements NestMiddleware {
    constructor(private readonly ResponseHandler: ResponseHandlerService){}
  use(req: Request, res: Response, next: NextFunction) {

    const errorResponse: ApiResponse.ApiErrorType = {
            status_code: ERROR_CODES.ACCESS_DENIED, message: ErrorMessages.NOT_AUTHORIZED, name: ""
          };
        console.log("payload",req['userPayload'])
          const payload: JWTPayload = req['userPayload'];
          if (payload.user_type != USER_TYPE.ADMIN) {
            this.ResponseHandler.sendErrorResponse(res, errorResponse)
          }
    next();
  }
}
