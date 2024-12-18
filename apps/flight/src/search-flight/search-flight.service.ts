import { Injectable } from '@nestjs/common';
import { SearchRepositoryService, SettingRepositoryService } from '../../../../libs/database/src';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import axios from 'axios';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
@Injectable()
export class SearchFlightService {
    constructor(
        private readonly settingRepo : SettingRepositoryService,
        private readonly tboConfigService : TBO_CredentialsService,
        private readonly searchrepositoryService : SearchRepositoryService
    ){}

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

          

            return { message :"Token and values aee gere", data :result}
        }catch(error){
            console.log(error);
            throw error
        }
    }

    async searchAirport(search_query:string):Promise<ApiResponse.ApiOK>{
        try {
            const airport_list = await this.searchrepositoryService.searchAirport(search_query);
            return { message :"Airport List fetched", data : airport_list}
        } catch(error){
            console.log(error);
            throw error
        }
    }
}
