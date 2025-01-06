import { Injectable } from '@nestjs/common';
import { SearchRepositoryService } from '../../../../libs/database/src';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/search-flights.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { JOURNEYTYPEMAPPING, TimeFilter } from '../../../../libs/constants/flightConstant'
// import { AirportType } from '../../../../libs/interfaces/flight/search.interface';
import { FlightValidator } from './search-utility';
import { AirportType } from '../../../../libs/interfaces/flight/search.interface';
import path from 'path';
import * as fs from 'fs';

@Injectable()
export class SearchFlightService {
  constructor(
    private readonly searchrepositoryService: SearchRepositoryService,
    private readonly generateTokenService: GenerateTokenService,
    private readonly httptboapiservice: HTTPSTboAPIService
  ) {
  }


  async searchAirport(page: number, pageSize: number, search_query: string): Promise<ApiResponse.ApiOK> {
    try {


      let airport_list: AirportType[] = await this.generateTokenService.getCache('airportList') as AirportType[];


      if (typeof airport_list === "string") {

        airport_list = JSON.parse(airport_list);

      }

      if (!search_query && airport_list) {
        return { message: "Airport List fetched", data: airport_list };
      }

      if (!airport_list) {
        airport_list = await this.searchrepositoryService.searchAirport(page, pageSize, search_query);
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

      await this.generateTokenService.deleteCache('airportList');

      await this.generateTokenService.setCache('airportList', JSON.stringify(airport_list), 86400);

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

      const responsefromTBO = await this.httptboapiservice.searchFlightAPI(token, base_url, base_ip, {
        ...body,
        journey_type: assigned_journey_type,
        preferred_time: preferredTimeValue,
      });

      const trans = await this.fetchSegmentsDataAsPerJourneyType(responsefromTBO, assigned_journey_type)

      await this.generateTokenService.setCache(`${origin}${destination}`, JSON.stringify(trans), 3600); // 1 minute

      return { message: "Flight list fetched successfully", data: trans };

    } catch (error) {
      console.log("Error in the search flight function", error);
      throw error;
    }
  }


  async fetchSegmentsDataAsPerJourneyType(response, journey_type: number) {
    try {

      const flightList = {};
      const result = response.Response?.Results?.[0];
      const roundtrip_dometic_result = response.Response?.Results?.[1];
      const origin = response.Response?.Origin;
      const destination = response.Response?.Destination;
      const trace_id = response.Response?.TraceId;

      if (!result) {
        console.error("Invalid response structure or empty Results.");
        throw `("result is empty")`;
      }

      //Oneway 
      if (journey_type === 1) {

        const segments = await this.handleFlightListingSegments(result);

        return { flight_list: segments, origin, destination, trace_id };
      }

      //RoundTrip
      if (journey_type === 2) {

        if (response.Response?.Results?.length === 1) {
          //international flights 

          const { flightData } = await this.handleFlightListingSegments(result);

          flightList['departure_flights'] = flightData
        } else {
          //domestic flights

          const segment1 = await this.handleFlightListingSegments(result)
          const segment2 = await this.handleFlightListingSegments(roundtrip_dometic_result)

          flightList['departure_flights'] = segment1;
          flightList['arrival_flights'] = segment2

        }
        return { flight_list: flightList, origin, destination, trace_id };
      }

      // Multicity
      if (journey_type === 3) {

        const segment = await this.handleFlightListingSegmentsForMulticity(result);

        return { flight_list: segment, origin, destination, trace_id };
      }

      throw result
    } catch (error) {
      console.error("Error in fetchSegmentsDataAsPerJourneyType:", error);
      throw ("Invalid travel type or data structure");
    }
  }



  async handleFlightListingSegmentsForMulticity(searchflight) {
    try {

      const flightData = []

      for (const flight of searchflight) {

        const flight_segment = [];

        for (const segment of searchflight.Segments) {


          flight_segment.push(segment);
        }


        const flightJson = {
          ResultIndex: flight.ResultIndex,
          flight_segment

        }

        flightData.push(flightJson)
      }

      return { flightData };

    } catch (error) {
      console.log("Error in getDepartureAndArrivalFlights", error);
      throw error;
    }
  }
  

  async handleFlightListingSegments(searchflight) {
    try {

      const flightData = []

      for (const flight of searchflight) {

        const departure = flight.Segments && flight.Segments.length > 0 ? flight.Segments[0] : [];
        const arrival = flight.Segments && flight.Segments.length > 1 ? flight.Segments[1] : [];

        const flightJson = {
          ResultIndex: flight.ResultIndex,
          departure,
          arrival

        }

        flightData.push(flightJson)
      }

      return { flightData };

    } catch (error) {
      console.log("Error in getDepartureAndArrivalFlights", error);
      throw error
    }

  }

  async uploadAirport(file) {
    try {
      if (!file) {
        throw { message: "No file uploaded. Please upload an Excel file.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
      // Define the folder path
      const uploadDir = path.join(__dirname, 'uploads');

      // Check if the folder exists, if not create it
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });  // This creates the directory if it doesn't exist
        console.log("Created uploads directory");
      }

      const uploadPath = path.join(uploadDir, file.originalname);
      fs.writeFileSync(uploadPath, file.buffer);  // Save the file

      console.log("File saved to:", uploadPath);
      await this.searchrepositoryService.uploadExcelData(uploadPath);
      return { message: "Uploaded airport successfully", data: null };
    } catch (error) {
      console.log("error in the upload file", error.message);
      throw error;
    }

  }
}  
