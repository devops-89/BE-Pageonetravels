import { Injectable } from "@nestjs/common";
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FLIGHTDATA } from "../../../../libs/config/config.interface";
import axios from 'axios';
@Injectable()
export class GenerateTokenService {
    private tbo_credentials: FLIGHTDATA
    private tbo_token: string
    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
    ) {
    }


    async generateToken() {

        try {

            this.tbo_credentials = await this.tboConfigService.getTBOCredentials();
            console.log("TOB", this.tbo_credentials);

            const base_url = this.tbo_credentials.FLIGHT_AUTHENTICATION;

            const payload = {
                ClientId: this.tbo_credentials.FLIGHT_CLIENT_ID,
                UserName: this.tbo_credentials.FLIGHT_USERNAME,
                Password: this.tbo_credentials.FLIGHT_PASSWORD,
                EndUserIp: this.tbo_credentials.FLIGHT_ENDUSERIP,
            }

            const result = await axios.post(base_url, payload)

            this.tbo_token = result.data.TokenId;
            console.log("Tojen", result.data, this.tbo_token);
            return this.tbo_token;
           
        } catch (error) {
            console.log(error);
            throw error
        }
    }

    async getToken() {
        try {
            if (!this.tbo_token) {
                await this.generateToken();
            }
            console.log("Tokennnn", this.tbo_token);
            const payload = {
                TBO_data: this.tbo_credentials,
                token: this.tbo_token
            }
            return payload
        } catch (error) {
            console.error("failed in get token api",error);
            throw error
        }
    }
}