import { Injectable } from '@nestjs/common';
import { SettingRepositoryService } from '../../../../libs/database/src';
// import { ApiResponse } from 'libs/interfaces/commonTypes/apiResponse.interface';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { SearchRepositoryService } from '../../../../libs/database/src/repositories/search.repository';
import axios from 'axios';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
@Injectable()
export class SearchFlightService {
    constructor(
        private readonly settingRepo : SettingRepositoryService,
        private readonly tboConfigService : TBO_CredentialsService,
        private readonly searchRepository  : SearchRepositoryService
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
           
            let token = "";
            const getToken = await axios.post(base_url,payload).then(function (response) {
                console.table(
                    response.data.TokenId 
                );
                token = response.data.TokenId 
            })
            .catch(function (error) {
                console.log(error);
            });

            console.log("Result", getToken);
            
            return { message: "Token and values aee gere", data: result, token: token }
        }catch(error){
            console.log(error);
            throw error
        }
    }

    // async searchAirport(){
    //     try {
    //         let airport = await this.sea
    //     }catch(error){
    //         throw error
    //     }
    // }

    async searchFlight(body: SearchFlightDto){
        const token = await this.generateToken();
        console.log(">>>> token",  token);
        const resultURL = await this.tboConfigService.generateToken();
        const base_url = resultURL.FLIGHT_SEARCH;
        const base_ip = resultURL.FLIGHT_ENDUSERIP;
        const { journey_type, origin, destination, journey_date, adult, child, infant, direct_flight, one_stop_flight, cabin_class } = body;
        // const result = this.searchRepository.searcflight(token,body);
        const payload = {
            "EndUserIp": base_ip,
            "TokenId": token,
            "AdultCount": adult,
            "ChildCount": child,
            "InfantCount": infant,
            "DirectFlight": direct_flight,
            "OneStopFlight": one_stop_flight,
            "JourneyType": journey_type,
            "PreferredAirlines": null,
            "Segments": [
                {
                    "Origin": origin,
                    "Destination": destination,
                    "FlightCabinClass": cabin_class,
                    "PreferredDepartureTime": journey_date+"T00: 00: 00",
                    "PreferredArrivalTime": journey_date+"T00: 00: 00"
                }
            ],
            "Sources": null
        }

        console.log(payload);

    }
}
