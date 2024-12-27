import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { SearchRepositoryService, SettingRepositoryService } from '../../../../libs/database/src';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { JOURNEY_TYPE } from '../../../../libs/constants/flightConstant';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { TBOResponse, FlightDetails, FlightSegment } from '../../../../libs/config/config.interface'; // Replace with the correct path


@Injectable()
export class SearchFlightService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
        private readonly settingRepo: SettingRepositoryService,
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly searchrepositoryService: SearchRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly httptboapiservice: HTTPSTboAPIService
    ) { }


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


            const { journey_type, departure_date, return_date, multicity = [], adult = 0, child = 0, infant = 0, ip_address } = body;

            if (adult < 1) {
                return { message: "At least one adult passenger is required", status_code: ERROR_CODES.BAD_REQUEST };
            }
            if (adult < infant) {
                return { message: "Number of adults should be greater than or equal to infants", status_code: ERROR_CODES.BAD_REQUEST };
            }
            const totalPassengers = adult + child + infant;
            if (totalPassengers > 9) {
                return { message: "Total passengers should not exceed 9", status_code: ERROR_CODES.BAD_REQUEST };
            }

            const today = new Date();
            const departureDate = new Date(departure_date);

            if (!departure_date || departureDate <= today) {
                return { message: "Departure date should be a future date", status_code: ERROR_CODES.BAD_REQUEST };
            }

            if (journey_type === JOURNEY_TYPE.ROUNDTRIP) {
                const returnDate = new Date(return_date);

                if (!return_date) {
                    return { message: "Return date is required for a round trip", status_code: ERROR_CODES.BAD_REQUEST };
                }
                if (returnDate <= departureDate) {
                    return { message: "Return date should be greater than the departure date", status_code: ERROR_CODES.BAD_REQUEST };
                }
            }

            if (journey_type === JOURNEY_TYPE.MULTICITY && multicity.length === 0) {
                return { message: "Multicity journey requires at least one segment", status_code: ERROR_CODES.BAD_REQUEST };
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


            const transform_data = this.extractFlightData(response);
            return { message: 'Flight data processed successfully', data: transform_data };
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.FORBIDDEN,
                error: 'This is a custom message',
            }, HttpStatus.FORBIDDEN, {
                cause: error
            });
        }
    
    }

    private extractFlightData(response: TBOResponse): FlightDetails[] {
        try {
          return response.Response.Results.flatMap((result) =>
            result.map((flight) => {
              const segmentDetails: FlightSegment[] = flight.Segments.flatMap((segmentGroup) =>
                segmentGroup.map((segment) => ({
                  Departure: `${segment.Origin.Airport.CityName} (${segment.Origin.Airport.AirportCode})`,
                  Arrival: `${segment.Destination.Airport.CityName} (${segment.Destination.Airport.AirportCode})`,
                  DepartureTime: segment.Origin.DepTime,
                  ArrivalTime: segment.Destination.ArrTime,
                  FlightName: segment.Airline.AirlineName,
                  FlightNumber: segment.Airline.FlightNumber,
                  AirlineCode: segment.Airline.AirlineCode,
                  FlightImage: segment.Craft || null,
                  Duration: segment.Duration,
                  NoOfSeatAvailable: segment.NoOfSeatAvailable ?? 0,
                })),
              );
      
              return {
                TraceID: flight.TraceId,
                ResultIndex: flight.ResultIndex,
                TotalJourneyDuration: segmentDetails.reduce((acc, seg) => acc + seg.Duration, 0),
                IsRefundable: flight.IsRefundable ? 'Yes' : 'No',
                IsLCC: flight.IsLCC ? 'Yes' : 'No',
                SeatsAvailable: segmentDetails[0]?.NoOfSeatAvailable || 0,
                FlightPrice: flight.Fare.PublishedFare,
                SegmentDetails: segmentDetails,
              };
            }),
          );
        } catch (error) {
          console.error('Error extracting flight data:', error);
          throw new HttpException('Failed to process flight data', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}




























// import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
// import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
// import { GenerateTokenService } from './generateToken.service';
// import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
// import { JOURNEY_TYPE } from '../../../../libs/constants/flightConstant';
// import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
// import { SearchRepositoryService} from '../../../../libs/database/src';
// import { TBOResponse, FlightDetails, FlightSegment } from '../../../../libs/config/config.interface'; // Replace with the correct path
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';



// @Injectable()
// export class SearchFlightService {
//     constructor(
//         @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
//         private readonly generateTokenService: GenerateTokenService,
//         private readonly httpTboAPIService: HTTPSTboAPIService,
//         private readonly searchrepositoryService: SearchRepositoryService,
//     ) {}


//         async searchAirport(search_query: string): Promise<ApiResponse.ApiOK> {
//         try {
//             const airport_list = await this.searchrepositoryService.searchAirport(search_query);
//             return { message: "Airport List fetched", data: airport_list }
//         } catch (error) {
//             console.log(error);
//             throw error
//         }
//     }

//     // async searchFlight(body: SearchFlightDto): Promise<ApiResponse.ApiOK> {
//     //     try {
//     //         this.validateFlightRequest(body);

//     //         const { token, TBO_data } = await this.generateTokenService.getToken(body.ip_address);
//     //         const { FLIGHT_SEARCH: base_url, FLIGHT_ENDUSERIP: base_ip } = TBO_data;

//     //         const response: Response = await this.httpTboAPIService.searchFlightAPI(token, base_url, base_ip, body);

//     //         const flightData = this.extractFlightData(response);

//     //         return { message: 'Flight data processed successfully', data: flightData };
//     //     } catch (error) {
//     //         console.error('Error in searchFlight:', error);
//     //         throw new HttpException(
//     //             {
//     //                 status: HttpStatus.INTERNAL_SERVER_ERROR,
//     //                 error: error.message || 'Internal Server Error',
//     //             },
//     //             HttpStatus.INTERNAL_SERVER_ERROR,
//     //         );
//     //     }
//     // }


//     async searchFlight(body: SearchFlightDto): Promise<ApiResponse.ApiOK> {
//         try {
//             const { journey_type, departure_date, return_date, multicity = [], adult = 0, child = 0, infant = 0, ip_address } = body;
    
//             // Validation
//             if (adult < 1) {
//                 return { message: "At least one adult passenger is required", statusCode: ERROR_CODES.BAD_REQUEST };
//             }
//             if (adult < infant) {
//                 return { message: "Number of adults should be greater than or equal to infants", statusCode: ERROR_CODES.BAD_REQUEST };
//             }
//             const totalPassengers = adult + child + infant;
//             if (totalPassengers > 9) {
//                 return { message: "Total passengers should not exceed 9", statusCode: ERROR_CODES.BAD_REQUEST };
//             }
    
//             const today = new Date();
//             const departureDate = new Date(departure_date);
    
//             if (!departure_date || departureDate <= today) {
//                 return { message: "Departure date should be a future date", statusCode: ERROR_CODES.BAD_REQUEST };
//             }
    
//             if (journey_type === JOURNEY_TYPE.ROUNDTRIP) {
//                 const returnDate = new Date(return_date);
//                 if (!return_date) {
//                     return { message: "Return date is required for a round trip", statusCode: ERROR_CODES.BAD_REQUEST };
//                 }
//                 if (returnDate <= departureDate) {
//                     return { message: "Return date should be greater than the departure date", statusCode: ERROR_CODES.BAD_REQUEST };
//                 }
//             }
    
//             if (journey_type === JOURNEY_TYPE.MULTICITY && multicity.length === 0) {
//                 return { message: "Multicity journey requires at least one segment", statusCode: ERROR_CODES.BAD_REQUEST };
//             }
    
//             // Map journey type to API codes
//             const journeyTypeMap = {
//                 [JOURNEY_TYPE.ONEWAY]: 1,
//                 [JOURNEY_TYPE.ROUNDTRIP]: 2,
//                 [JOURNEY_TYPE.MULTICITY]: 3,
//                 [JOURNEY_TYPE.ADVANCE]: 4,
//                 [JOURNEY_TYPE.SPECIALRETURN]: 5,
//             };
    
//             const apiJourneyType = journeyTypeMap[journey_type] || 1;
    
//             // Fetch token and configuration
//             const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);
//             const { FLIGHT_SEARCH: base_url, FLIGHT_ENDUSERIP: base_ip } = TBO_data;
    
//             // Call the TBO API and process the response
//             const response = await this.httpTboAPIService.searchFlightAPI(token, base_url, base_ip, {
//                 ...body,
//                 journey_type: apiJourneyType,
//             });
    
//             // Use the response to extract flight data
//             const flightData = this.extractFlightData(response);
    
//             // Return the processed flight data
//             return { message: 'Flight data processed successfully', data: flightData };
    
//         } catch (error) {
//             console.error('Error in searchFlight:', error);
//             throw new HttpException('Failed to process flight data', HttpStatus.INTERNAL_SERVER_ERROR);
//         }
//     }
    
        
//     private validateFlightRequest(body: SearchFlightDto): void {
//         const { journey_type, departure_date, return_date, multicity, adult, child, infant } = body;

//         if (adult < 1) throw new HttpException('At least one adult passenger is required', HttpStatus.BAD_REQUEST);
//         if (adult < infant)
//             throw new HttpException('Number of adults should be greater than or equal to infants', HttpStatus.BAD_REQUEST);
//         if (adult + child + infant > 9)
//             throw new HttpException('Total passengers should not exceed 9', HttpStatus.BAD_REQUEST);

//         const today = new Date();
//         const departureDate = new Date(departure_date);
//         if (!departure_date || departureDate <= today)
//             throw new HttpException('Departure date should be a future date', HttpStatus.BAD_REQUEST);

//         if (journey_type === JOURNEY_TYPE.ROUNDTRIP) {
//             const returnDate = new Date(return_date);
//             if (!return_date) throw new HttpException('Return date is required for a round trip', HttpStatus.BAD_REQUEST);
//             if (returnDate <= departureDate)
//                 throw new HttpException('Return date should be greater than the departure date', HttpStatus.BAD_REQUEST);
//         }

//         if (journey_type === JOURNEY_TYPE.MULTICITY && multicity.length === 0)
//             throw new HttpException('Multicity journey requires at least one segment', HttpStatus.BAD_REQUEST);
//     }
//     private extractFlightData(response: TBOResponse): FlightDetails[] {
//         try {
//           return response.Response.Results.flatMap((result) =>
//             result.map((flight) => {
//               const segmentDetails: FlightSegment[] = flight.Segments.flatMap((segmentGroup) =>
//                 segmentGroup.map((segment) => ({
//                   Departure: `${segment.Origin.Airport.CityName} (${segment.Origin.Airport.AirportCode})`,
//                   Arrival: `${segment.Destination.Airport.CityName} (${segment.Destination.Airport.AirportCode})`,
//                   DepartureTime: segment.Origin.DepTime,
//                   ArrivalTime: segment.Destination.ArrTime,
//                   FlightName: segment.Airline.AirlineName,
//                   FlightNumber: segment.Airline.FlightNumber,
//                   AirlineCode: segment.Airline.AirlineCode,
//                   FlightImage: segment.Craft || null,
//                   Duration: segment.Duration,
//                   NoOfSeatAvailable: segment.NoOfSeatAvailable ?? 0,
//                 })),
//               );
      
//               return {
//                 TraceID: flight.TraceId,
//                 ResultIndex: flight.ResultIndex,
//                 TotalJourneyDuration: segmentDetails.reduce((acc, seg) => acc + seg.Duration, 0),
//                 IsRefundable: flight.IsRefundable ? 'Yes' : 'No',
//                 IsLCC: flight.IsLCC ? 'Yes' : 'No',
//                 SeatsAvailable: segmentDetails[0]?.NoOfSeatAvailable || 0,
//                 FlightPrice: flight.Fare.PublishedFare,
//                 SegmentDetails: segmentDetails,
//               };
//             }),
//           );
//         } catch (error) {
//           console.error('Error extracting flight data:', error);
//           throw new HttpException('Failed to process flight data', HttpStatus.INTERNAL_SERVER_ERROR);
//         }
//       }
 
// }  