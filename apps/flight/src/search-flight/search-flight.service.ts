import { Injectable } from '@nestjs/common';
import { SearchRepositoryService, SettingRepositoryService } from '../../../../libs/database/src';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/flights.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { JOURNEYTYPEMAPPING, TimeFilter } from '../../../../libs/constants/flightConstant'
import { AirportType } from '../../../../libs/interfaces/flight/search.interface';
import { FlightValidator } from './search-utility';

@Injectable()
export class SearchFlightService {
  constructor(
    private readonly settingRepo: SettingRepositoryService,
    private readonly tboConfigService: TBO_CredentialsService,
    private readonly searchrepositoryService: SearchRepositoryService,
    private readonly generateTokenService: GenerateTokenService,
    private readonly httptboapiservice: HTTPSTboAPIService
  ) {
  }


  async searchAirport(search_query: string): Promise<ApiResponse.ApiOK> {
    try {
      if (!search_query) {
        return { message: "Kindly send search query", statusCode: ERROR_CODES.BAD_REQUEST };
      }

      let airport_list: AirportType[] = await this.generateTokenService.getCache('airportList') as AirportType[];

      if (typeof airport_list === "string") {

        airport_list = JSON.parse(airport_list);

      }

      if (!airport_list) {
        airport_list = await this.searchrepositoryService.searchAirport(search_query);
      }

      const regex = new RegExp(`^${search_query}`, 'i');

      const filtered_airport_list = airport_list.filter((airport) => {
        return regex.test(airport.iata_code) || regex.test(airport.airport_name);
      });
  

      return { message: "Airport List fetched", data: filtered_airport_list };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }


  async searchAllAirport(): Promise<ApiResponse.ApiOK> {
    try {

      const airport_list = await this.searchrepositoryService.searchAirport();

      await this.generateTokenService.setCache('airportList', JSON.stringify(airport_list));

      return { message: "Airport List fetched", data: airport_list }
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  async searchFlight(body: SearchFlightDto) {
    try {

      const {
        preferred_time,
        origin,
        destination,
        journey_type,
        departure_date,
        return_date,
        cabin_class,
        multicity = [],
        adult = 0,
        child = 0,
        infant = 0,
        ip_address,
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


      switch (journey_type) {

        case JOURNEYTYPEMAPPING.ONEWAY:
          FlightValidator.validateOriginDestination(origin, destination);
          FlightValidator.validateFutureDate(departure_date, "Departure date should be a future date.");
          FlightValidator.validateCabinClass(cabin_class);
          break;

        case JOURNEYTYPEMAPPING.ROUNDTRIP:
          FlightValidator.validateOriginDestination(origin, destination);
          FlightValidator.validateFutureDate(departure_date, "Departure date should be a future date.");
          FlightValidator.validateCabinClass(cabin_class);
          FlightValidator.validateReturnDate(departure_date, return_date, "Departure date should be less than return date");
          break;

        case JOURNEYTYPEMAPPING.MULTICITY:
          if (multicity.length === 0) {
            throw new Error("Multicity journey requires at least one segment.");
          }
          multicity.forEach((segment, index) => {
            FlightValidator.validateOriginDestination(segment.origin, segment.destination);
            FlightValidator.validateFutureDate(segment.departure_date, `Segment ${index + 1}: Departure date should be a future date.`);
            FlightValidator.validateCabinClass(segment.cabin_class);
          });
          break;
      }


      const preferredTimeMapping: Record<string, string> = {
        [TimeFilter.Morning]: '08:00:00',
        [TimeFilter.AfterNoon]: '14:00:00',
        [TimeFilter.Evening]: '19:00:00',
        [TimeFilter.Night]: '01:00:00',
        [TimeFilter.AnyTime]: '00:00:00',
      };

      const preferredTimeValue = preferredTimeMapping[preferred_time] || '00:00:00';

      const journeyTypeMapping: Record<string, number> = {
        [JOURNEYTYPEMAPPING.ONEWAY]: 1,
        [JOURNEYTYPEMAPPING.ROUNDTRIP]: 2,
        [JOURNEYTYPEMAPPING.MULTICITY]: 3,
      };
      const assigned_journey_type = journeyTypeMapping[journey_type] || 1;



      const { token, TBO_data } = await this.generateTokenService.getToken(ip_address);

      const { FLIGHT_SEARCH: base_url, FLIGHT_ENDUSERIP: base_ip } = TBO_data;

      const response = await this.httptboapiservice.searchFlightAPI(token, base_url, base_ip, {
        ...body,
        journey_type: assigned_journey_type,
        preferred_time: preferredTimeValue,
      });

      return { message: "Flight list fetched successfully", data: response };
    } catch (error) {
      console.log("Error in the search flight function", error);
      throw error;
    }
  }

  
}
