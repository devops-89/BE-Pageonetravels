import { Inject, Injectable } from "@nestjs/common";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FLIGHTDATA } from "../../../../libs/config/config.interface";
import axios from 'axios';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';

@Injectable()
export class GenerateTokenService {
    // private tbo_credentials: FLIGHTDATA | undefined=undefined;
    private tbo_token: string
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly tboConfigService: TBO_CredentialsService,
    ) {
    }


    async generateTBOToken(ip_address:string) {
        try {
            const tbo_credentials = await this.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_AUTHENTICATION;

            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                // EndUserIp: this.tbo_credentials.FLIGHT_ENDUSERIP,
                EndUserIp: ip_address,
            }

            const result = await axios.post(base_url, payload)
            await this.setCache(ip_address,result.data.TokenId);
            return this.tbo_token;
           
        } catch (error) {
            console.log("Error in the generate token", error);
            throw error
        }
    }

    async getTBOCredentials(){
        try {
            const tbo_credentials = await this.tboConfigService.getTBOCredentials();
            return tbo_credentials as FLIGHTDATA
        }catch(error){
            console.log("Error in the generate token", error);
            throw error
        }
    }
    

    async getToken(ip_address: string) {
        try {
           
            let token = await this.getCache(ip_address);
            const tbo_credentials = await this.getTBOCredentials();
            if (!token) {
                await this.generateTBOToken(ip_address);

                token = await this.getCache(ip_address);
            }
            
            const payload = {
                TBO_data: tbo_credentials,
                token: token as string,
            };
    
            return payload;
    
        } catch (error) {
            console.error("Failed in getToken API:", error);
            throw error;
        }
    }
    

    async setCache(ip_address: string, token: string,) {
        const ip_key = `tboToken:${ip_address}`
        await this.cacheManager.set(ip_key, `${token}`,  82800); // ttl in seconds
    }

    async getCache(ip_address: string) {
        const ip_key = `tboToken:${ip_address}`
        const value = await this.cacheManager.get(`${ip_key}`); // ttl in seconds
        return value
    }
}