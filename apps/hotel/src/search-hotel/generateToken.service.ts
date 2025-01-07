import { Inject, Injectable } from "@nestjs/common";
import { HotelTBO_CredentialsService } from '../../../../libs/loadtbo-db-config/hoteltbo-config.service';
import axios from 'axios';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager';

@Injectable()
export class GenerateTokenService {
    private tbo_token: string;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly tboConfigService: HotelTBO_CredentialsService,
    ) {}


    async generateHOTELToken(ip_address: string) {
        try {
            const tbo_credentials = await this.getHotelTBOCredentials();
            const base_url = tbo_credentials.HOTEL_AUTHENTICATION;  // Use hotel-specific URL

            const payload = {
                ClientId: tbo_credentials.HOTEL_CLIENT_ID,
                UserName: tbo_credentials.HOTEL_USERNAME,  // Change username
                Password: tbo_credentials.HOTEL_PASSWORD,  // Change password
                EndUserIp: ip_address,
            };

            const result = await axios.post(base_url, payload);
            await this.setCache(ip_address, result.data.TokenId);
            return this.tbo_token;
        } catch (error) {
            console.log("Error in the generate token for hotel", error);
            throw error;
        }
    }

    // Get credentials for hotel
    async getHotelTBOCredentials() {
        try {
            const hoteltbo_credentials = await this.tboConfigService.getHotelTBOCredentials();
          
        } catch (error) {
            console.log("Error in fetching hotel credentials", error);
            throw error;
        }
    }
    
    // Get token (used for hotel searches)
    async getToken(ip_address: string) {
        try {
            let token = await this.getCache(ip_address);
            const tbo_credentials = await this.getHotelTBOCredentials();
            if (!token) {
                await this.generateHOTELToken(ip_address);
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

    // Cache management
    async setCache(ip_address: string, token: string) {
        const ip_key = `tboToken:${ip_address}`;
        await this.cacheManager.set(ip_key, `${token}`, 82800); // ttl in seconds
    }

    async getCache(ip_address: string) {
        const ip_key = `tboToken:${ip_address}`;
        const value = await this.cacheManager.get(ip_key);
        return value;
    }
}