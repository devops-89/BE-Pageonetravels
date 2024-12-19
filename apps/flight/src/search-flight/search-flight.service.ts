import { Injectable } from '@nestjs/common';
import { SearchRepositoryService, SettingRepositoryService } from '../../../../libs/database/src';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import axios from 'axios';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
import { IFlightSearch } from '../../../../libs/interfaces/flight/search.interface';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
// import { FLIGHTDATA } from '../../../../libs/config/config.interface';
@Injectable()
export class SearchFlightService {
    // private tbo_credentials : FLIGHTDATA 
    constructor(
        private readonly settingRepo: SettingRepositoryService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly searchrepositoryService: SearchRepositoryService,
        private readonly generateTokenService: GenerateTokenService
    ) {
        // this.tbo_credentials = tbo_credentials; 
    }


    // async generateToken() {

    //     try {

    //         this.tbo_credentials = await this.tboConfigService.getTBOCredentials();
    //         // const tbo_credentials = await this.tboConfigService.getTBOCredentials();

    //         const base_url = this.tbo_credentials.FLIGHT_AUTHENTICATION;
    //         const payload = {
    //             ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
    //             UserName: tbo_credentials.FLIGHT_USERNAME,
    //             Password: tbo_credentials.FLIGHT_PASSWORD,
    //             EndUserIp: tbo_credentials.FLIGHT_ENDUSERIP,
    //         }
    //         // const base_url = this.tbo_credentials.FLIGHT_AUTHENTICATION;
    //         // const payload = {
    //         //     ClientId: this.tbo_credentials.FLIGHT_CLIENT_ID,
    //         //     UserName: this.tbo_credentials.FLIGHT_USERNAME,
    //         //     Password: this.tbo_credentials.FLIGHT_PASSWORD,
    //         //     EndUserIp: this.tbo_credentials.FLIGHT_ENDUSERIP,
    //         // }

    //         let token = "";
    //         const getToken = await axios.post(base_url, payload).then(function (response) {
    //             console.table(
    //                 response.data.TokenId
    //             );
    //             token = response.data.TokenId
    //         })
    //             .catch(function (error) {
    //                 console.log(error);
    //             });

    //         console.log("Result", getToken);

    //         return { message: "Token and values aee gere", data: token }
    //     } catch (error) {
    //         console.log(error);
    //         throw error
    //     }
    // }

    // async getToken(){
        
    // }

    async searchAirport(search_query: string): Promise<ApiResponse.ApiOK> {
        try {
            const airport_list = await this.searchrepositoryService.searchAirport(search_query);
            return { message: "Airport List fetched", data: airport_list }
        } catch (error) {
            console.log(error);
            throw error
        }
    }


    async searchFlight(body: SearchFlightDto) {
        try {
            const { journey_type, origin, destination, journey_date, adult, child, infant, direct_flight, one_stop_flight, cabin_class } = body;
            if (!adult) {
                return { message: "Kindly send passenger", statusCode: ERROR_CODES.BAD_REQUEST }
            }

            const totalPassenger = adult + child + infant;
            if (totalPassenger > 10) {
                return { message: "Total passenger should be less than 9", statusCode: ERROR_CODES.BAD_REQUEST }
            }

            if (adult < infant) {
                return { message: "No of adult shoould greater than infants", statusCode: ERROR_CODES.BAD_REQUEST }
            }

            const { token , TBO_data} = await this.generateTokenService.getToken();

            // const base_ip = tbo_credentials.FLIGHT_ENDUSERIP;
            // const tbo_credentials = await this.tboConfigService.getTBOCredentials();

            const base_url = TBO_data.FLIGHT_SEARCH;

            const base_ip = TBO_data.FLIGHT_ENDUSERIP;

            const payload: IFlightSearch = {
                EndUserIp: base_ip,
                TokenId: token,
                AdultCount: adult,
                ChildCount: child,
                InfantCount: infant,
                DirectFlight :direct_flight,
                JourneyType: journey_type,
                OneStopFlight: one_stop_flight,
                PreferredAirlines: null,
                Segments: [
                    {
                        Origin: origin,
                        Destination: destination,
                        FlightCabinClass: cabin_class,
                        PreferredDepartureTime: journey_date + "T00:00:00",
                        PreferredArrivalTime: journey_date + "T00:00:00",
                    },
                ],
                Sources: null,
            };
            // if (direct_flight !== undefined) {
            //     payload.DirectFlight = direct_flight;
            // }
            // if (journey_type !== undefined) {
            //     payload.JourneyType = journey_type;
            // }
            try {
                await axios.post(base_url, payload).then((res)=>{
                    console.log("Res>>>>>>>>>>>>>>>>>>",res.data);
                })
                // const response = flightList.data;
                return { message: "Flight list fetched successfully", data: null }
            } catch (error) {
                console.log("error in seraching", JSON.stringify(error))
            }
            // .then((response) => {
            //     console.log("Result", response)
            //     flightList = response;
            // })
            // .catch((error) => {
            //     console.log("Error", error);
            // });
            // const response = flightList.data;
            return { message: "Flight list fetched successfully", data: null }


        } catch (error) {
            console.error("Error", error);
            throw error;
        }

    }
}
