
import { JWTPayload } from "../interfaces/authentication/jwtPayload.interface";

export function setAuthPayload(req:any, payload:JWTPayload) 
{
    req['userPayload'] = payload;
    return;
}

export function getAuthPayload(req: any) 
{
    return req.userPayload ? req.userPayload : null;
}

export function getAuthenticationToken(req: any) 
{
    const accessToken = req.headers['accesstoken'] as string || null;
    return accessToken;
}

