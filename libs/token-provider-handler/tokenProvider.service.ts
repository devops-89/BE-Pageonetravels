import { Injectable } from '@nestjs/common';
import { RedisCacheService } from '../redis-cache-service/redis-cache-service';
import { TBO_CredentialsService } from '../loadtbo-db-config/tbo-config.service';
import { FLIGHTDATA } from '../config/config.interface';
import axios from 'axios';

@Injectable()
export class TokenProviderService {
    private tbo_token: string;
    constructor(
        private readonly tboConfigService:TBO_CredentialsService,
        private readonly redisCacheService:RedisCacheService
    ) {}

    /**
     * Generate a fresh token from TBO and store it in Redis (valid for 1 day)
     */
    async generateTBOToken(ip_address: string): Promise<string> {
        try {
            const tbo_credentials = await this.getTBOCredentials();
            const base_url = tbo_credentials.FLIGHT_AUTHENTICATION;

            const payload = {
                ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: tbo_credentials.FLIGHT_USERNAME,
                Password: tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: ip_address,
            };

            const result = await axios.post(base_url, payload);

            // Save the token in class variable
            this.tbo_token = result.data.TokenId;

            // Cache it for ~23 hours (token valid for 24h)
            await this.redisCacheService.setCache(
                `tboToken:${ip_address}`,
                this.tbo_token,
                82800, // TTL in seconds
            );

            return this.tbo_token;
        } catch (error) {
            console.log('Error in generateTBOToken:', error);
            throw error;
        }
    }

    /**
     * Get TBO Credentials from DB/config
     */
    async getTBOCredentials(): Promise<FLIGHTDATA> {
        try {
            return await this.tboConfigService.getTBOCredentials();
        } catch (error) {
            console.log('Error in getTBOCredentials:', error);
            throw error;
        }
    }

    /**
     * Get cached token if exists, else generate new one
     */
    async getToken(ip_address: string) {
        try {
            let token = await this.redisCacheService.getCache(
                `tboToken:${ip_address}`,
            );

            const tbo_credentials = await this.getTBOCredentials();

            // If token not present in Redis, generate new one
            if (!token) {
                token = await this.generateTBOToken(ip_address);
            }

            const payload = {
                TBO_data: tbo_credentials,
                token: token as string,
            };

            console.log('Using token:', token);

            return payload;
        } catch (error) {
            console.error('Failed in getToken API:', error);
            throw error;
        }
    }
}
