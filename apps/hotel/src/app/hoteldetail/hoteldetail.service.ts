import { Injectable } from '@nestjs/common';
import { HotelTBOAPIService } from '../../../../../libs/http-api-service/hoteltbo-api-service';
import { HotelTBO_CredentialsService } from '../../../../../libs/loadtbo-db-config/hoteltbo-config.service';
import { HotelDetailRequestDto } from '../../../../../libs/dtos/hotel/hotel-detail.dto'

@Injectable()
export class HotelDetailService {
    constructor(private readonly hoteltboapiservice: HotelTBOAPIService,
        private readonly hoteltboConfigService: HotelTBO_CredentialsService,

    ) { }
    async FareRule(body: HotelDetailRequestDto) {
        try {

            const { ip_address, token, trace_id, result_index } = body;

            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const tbo_credentials = await this.hoteltboConfigService.getHotelTBOCredentials();

            const base_url = tbo_credentials.HOTEL_SEARCH;

            const response = await this.hoteltboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }

    async hotelDetail(body: HotelDetailRequestDto) {
        try {

            const { ip_address, token, trace_id, result_index } = body;

            const payload_request = {

                "EndUserIp": ip_address,
                "TokenId": token,
                "TraceId": trace_id,
                "ResultIndex": result_index

            }

            const hoteltbo_credentials = await this.hoteltboConfigService.getHotelTBOCredentials();

            const base_url = hoteltbo_credentials.HOTEL_SEARCH;

            const response = await this.hoteltboapiservice.fareRule(base_url, payload_request);

            return { message: "Fare Rules fetched successfully", data: response };

        } catch (error) {
            console.log("Error in the fare rule function", error);
            throw error;
        }
    }



























// import { Injectable } from '@nestjs/common';
// //import { HotelRepositoryService } from '../../../../libs/database/src';
// import { ApiResponse } from '../../../../../libs/interfaces/commonTypes/apiResponse.interface';
// import {HotelSearchDto } from '../../../../../libs/dtos/hotel/search-hotel.dto';
// import { HotelValidator } from '../../../../hotel/src/search-hotel/search-utility';
// import { GenerateTokenService } from '../../search-hotel/generateToken.service';
// import { HTTPSTboAPIService } from '../../../../../libs/http-api-service/tbo-api-service';
// //import { HOTELMAPPING, TimeFilter } from '../../../../libs/constants/hotelConstant';
// import { HotelType } from '../../../../../libs/interfaces/hotel/search.interface';
// import { ERROR_CODES } from '../../../../../libs/constants/commonConstants';

// @Injectable()
// export class HotelService {
//   constructor(
//     //private readonly hotelRepositoryService: HotelRepositoryService,
//     private readonly generateTokenService: GenerateTokenService,
//     private readonly httptboapiservice: HTTPSTboAPIService
//   ) {}

//   async searchHotelByLocation(location: string): Promise<ApiResponse.ApiOK> {
//     try {
//       if (!location) {
//         return { message: "Kindly send location", statusCode: ERROR_CODES.BAD_REQUEST };
//       }

//       let hotel_list: HotelType[] = await this.generateTokenService.getCache('hotelList') as HotelType[];

//       if (typeof hotel_list === "string") {
//         hotel_list = JSON.parse(hotel_list);
//       }

//       if (!hotel_list) {
//         hotel_list = await this.hotelRepositoryService.searchHotel(location);
//       }

//       const regex = new RegExp(`^${location}`, 'i');
//       const filtered_hotel_list = hotel_list.filter((hotel) => {
//         return regex.test(hotel.name) || regex.test(hotel.city);
//       });

//       return { message: "Hotel List fetched", data: filtered_hotel_list };
//     } catch (error) {
//       console.log(error);
//       throw error;
//     }
//   }

//   async searchHotel(body: HotelSearchDto): Promise<ApiResponse.ApiOK> {
//     try {
//       const { check_in, check_out, location, rooms, guests, city, ip_address } = body;

//       if (guests < 1) {
//         return { message: "At least one guest is required", statusCode: ERROR_CODES.BAD_REQUEST };
//       }

//       if (rooms > 5) {
//         return { message: "Maximum 5 rooms are allowed per search", statusCode: ERROR_CODES.BAD_REQUEST };
//       }

//       // Hotel-specific validations
//       HotelValidator.validateLocation(location);
//       HotelValidator.validateDates(check_in, check_out);

//       const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

//       const { HOTEL_SEARCH: base_url, HOTEL_ENDUSERIP: base_ip } = TBO_data;

//       const response = await this.httptboapiservice.searchHotelAPI(token, base_url, base_ip, {
//         ...body,
//         check_in_date: check_in,
//         check_out_date: check_out,
//       });

//       const transformed_data = this.fetchHotelData(response);

//       return { message: "Hotel list fetched successfully", data: transformed_data };
//     } catch (error) {
//       console.log("Error in the search hotel function", error);
//       throw error;
//     }
//   }

//   private fetchHotelData(response) {
//     try {
//       const result = response.Response.Results;
//       const transformed_hotels = result.map((hotel) => ({
//         name: hotel.name,
//         location: hotel.location,
//         price: hotel.price,
//         amenities: hotel.amenities,
//         rating: hotel.rating,
//         available_rooms: hotel.available_rooms,
//       }));

//       return transformed_hotels;
//     } catch (error) {
//       console.log("Error in hotel data transformation", error);
//       throw error;
//     }
//   }
// }


  }