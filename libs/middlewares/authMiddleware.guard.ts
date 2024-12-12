import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenValidationMiddleware, KeyValidationMiddleware, checkIfAdmin, TokenValidationAndGuestMiddleware, OptionalTokenValidationAndGuestMiddleware } from './authMiddleware';
import { TOKEN_TYPE } from '../constants/commonConstants';


@Injectable()
export class TokenValidationGuard implements CanActivate {
  constructor(private readonly tokenValidationMiddleware: TokenValidationMiddleware) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.tokenValidationMiddleware.use(request, response, (err: any) => {
        if (err) 
        {
          console.log("Error token validation", err)
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}

@Injectable()
export class TokenValidationAndGuestUserGuard implements CanActivate {
  constructor(private readonly tokenValidationAndGuestMiddleware: TokenValidationAndGuestMiddleware) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.tokenValidationAndGuestMiddleware.use(request, response, (err: any) => {
        if (err) 
        {
          console.log("Error token validation", err)
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}

@Injectable()
export class OptionalTokenValidationAndGuestUserGuard implements CanActivate {
  constructor(private readonly optionalTokenValidationAndGuestMiddleware: OptionalTokenValidationAndGuestMiddleware) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.optionalTokenValidationAndGuestMiddleware.use(request, response, (err: any) => {
        if (err) 
        {
          console.log("Error token validation", err)
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}

@Injectable()
export class KeyValidationGuard implements CanActivate {
  constructor(private readonly KeyValidationMiddleware: KeyValidationMiddleware) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.KeyValidationMiddleware.use(request, response, (err: any) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}

@Injectable()
export class CheckIfAdminGuard implements CanActivate {
  constructor(private readonly checkIfAdmin: checkIfAdmin) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return new Promise<boolean>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.checkIfAdmin.use(request, response, (err: any) => {
        if (err) {
          return reject(err);
        }
        resolve(true);
      });
    });
  }
}
