import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SearchRepositoryService, SettingRepositoryService } from '../../../../libs/database/src';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
// import axios from 'axios';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
// import { IFlightSearch } from '../../../../libs/interfaces/flight/search.interface';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
import {  HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
// import { FLIGHTDATA } from '../../../../libs/config/config.interface';
import { JOURNEY_TYPE } from '../../../../libs/constants/flightConstant'
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';

@Injectable()
export class SearchFlightService {
    // private tbo_credentials : FLIGHTDATA 
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
        private readonly settingRepo: SettingRepositoryService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly searchrepositoryService: SearchRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly httptboapiservice: HTTPSTboAPIService
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
            const {
                journey_type,
                departure_date,
                return_date,
                multicity = [],
                adult = 0,
                child = 0,
                infant = 0,
                ip_address
            } = body;
    
            if (adult < 1) {
                return { message: "At least one adult passenger is required", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            if (adult < infant) {
                return { message: "Number of adults should be greater than or equal to infants", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            const totalPassengers = adult + child + infant;
            if (totalPassengers > 9) {
                return { message: "Total passengers should not exceed 9", statusCode: ERROR_CODES.BAD_REQUEST };
            }
    
            
            const today = new Date();
            const departureDate = new Date(departure_date);
    
            if (!departure_date || departureDate <= today) {
                return { message: "Departure date should be a future date", statusCode: ERROR_CODES.BAD_REQUEST };
            }
    
            if (journey_type === JOURNEY_TYPE.ROUNDTRIP) {
                const returnDate = new Date(return_date);
    
                if (!return_date) {
                    return { message: "Return date is required for a round trip", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                if (returnDate <= departureDate) {
                    return { message: "Return date should be greater than the departure date", statusCode: ERROR_CODES.BAD_REQUEST };
                }
            }
    
            if (journey_type === JOURNEY_TYPE.MULTICITY && multicity.length === 0) {
                return { message: "Multicity journey requires at least one segment", statusCode: ERROR_CODES.BAD_REQUEST };
            }
            
            // Map journey type to API codes
            const journeyTypeMap = {
                [JOURNEY_TYPE.ONEWAY]: 1,
                [JOURNEY_TYPE.ROUNDTRIP]: 2,
                [JOURNEY_TYPE.MULTICITY]: 3,
                [JOURNEY_TYPE.ADVANCE]: 4,
                [JOURNEY_TYPE.SPECIALRETURN]: 5,
            };
            
            const apiJourneyType = journeyTypeMap[journey_type] || 1;
    
          
            const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

            const { FLIGHT_SEARCH: base_url, FLIGHT_ENDUSERIP: base_ip } = TBO_data;
    
            const response = await this.httptboapiservice.searchFlightAPI(token, base_url, base_ip, {
                ...body,
                journey_type: apiJourneyType,
            });
    
            return { message: "Flight list fetched successfully", data: response };
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'This is a custom message',
              }, HttpStatus.FORBIDDEN, {
                cause: error
              });
            }
    }
}
