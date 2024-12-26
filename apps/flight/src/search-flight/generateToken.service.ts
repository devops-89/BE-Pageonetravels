import { Inject, Injectable } from "@nestjs/common";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FLIGHTDATA } from "../../../../libs/config/config.interface";
import axios from 'axios';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';

@Injectable()
export class GenerateTokenService {
    private tbo_credentials: FLIGHTDATA
    private tbo_token: string
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly tboConfigService: TBO_CredentialsService,
    ) {
    }


    async generateTBOToken(ip_address:string) {
        try {

            this.tbo_credentials = await this.tboConfigService.getTBOCredentials();

            const base_url = this.tbo_credentials.FLIGHT_AUTHENTICATION;

            const payload = {
                ClientId: this.tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: this.tbo_credentials.FLIGHT_USERNAME,
                Password: this.tbo_credentials.FLIGHT_PASSWORD,
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

    async getToken(ip_address: string) {
        try {
           
            let token = await this.getCache(ip_address);

            if (!token) {
                await this.generateTBOToken(ip_address);
                token = await this.getCache(ip_address);
            }
    
           
            const payload = {
                TBO_data: this.tbo_credentials,
                token: token as string,
            };
    
            return payload;
    
        } catch (error) {
            console.error("Failed in getToken API:", error);
            throw error; // Re-throw the error for higher-level handling
        }
    }
    

    async setCache(ip_address: string, token: string) {
        const ip_key = `tboToken:${ip_address}`
        await this.cacheManager.set(ip_key, `${token}`,  82800); // ttl in seconds
    }

    async getCache(ip_address: string) {
        const ip_key = `tboToken:${ip_address}`
        const value = await this.cacheManager.get(`${ip_key}`); // ttl in seconds
        return value
    }
}