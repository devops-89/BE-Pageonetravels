import { Injectable } from '@nestjs/common';
import { SettingRepositoryService } from 'libs/database/src';
// import { ApiResponse } from 'libs/interfaces/commonTypes/apiResponse.interface';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import axios from 'axios';
@Injectable()
export class SearchFlightService {
    constructor(
        private readonly settingRepo : SettingRepositoryService,
        private readonly tboConfigService : TBO_CredentialsService
    ){
        
    }

    async generateToken(){
        try {
        
            const result = await this.tboConfigService.generateToken()
            
            const base_url = result.FLIGHT_AUTHENTICATION;
            const payload = {
                ClientId: result.FLIGHT_CLIENT_ID,
                UserName: result.FLIGHT_USERNAME,
                Password: result.FLIGHT_PASSWORD,
                EndUserIp: result.FLIGHT_ENDUSERIP,
            }
           
            const getToken = await axios.post(base_url,payload).then(function (response) {
                console.table(
                    response.data.TokenId
    
                );
            })
            .catch(function (error) {
                console.log(error);
            });

            console.log("Result", getToken);

            // store in the login table
           // Perform runtime checks before using the value
           //front end shoudl manage this key for every record check

            return { message :"Token and values aee gere", data :result}
        }catch(error){
            console.log(error);
            throw error
        }
    }
}
