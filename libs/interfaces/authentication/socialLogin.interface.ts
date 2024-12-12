import { USER_LOGIN_SOURCE } from "../../constants/autenticationConstants/userContants"

export interface SocialLoginSignup
{
    email: string,
    name: string,
    loginSource:USER_LOGIN_SOURCE
}

export interface SocailLoginSignup 
{
    accessToken: string,
    group: string | null,
    company: any
}


export interface GetGoogleToken
{ 
  code: string; clientId: string; clientSecret: string; redirectUri: string;
}

export interface GoogleTokenResponse
{
  access_token: string,
  expires_in: Number,
  refresh_token: string,
  scope: string,
  id_token: string,
  name: string,
  email: string,
}

export interface GoogleUserInfo 
{
  id: string,
  email: string,
  verified_email: boolean,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  locale: string
}
