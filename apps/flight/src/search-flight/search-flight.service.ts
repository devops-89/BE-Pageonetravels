import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SearchRepositoryService } from '../../../../libs/database/src';
import { ApiResponse } from '../../../../libs/interfaces/commonTypes/apiResponse.interface';
import { SearchFlightDto } from '../../../../libs/dtos/flight/search-flights.dto';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { GenerateTokenService } from './generateToken.service';
import { HTTPSTboAPIService } from '../../../../libs/http-api-service/tbo-api-service';
import { JOURNEYTYPEMAPPING, TimeFilter } from '../../../../libs/constants/flightConstant'
import { AirportType } from '../../../../libs/interfaces/flight/search.interface';
import { FlightValidator } from './search-utility';
import { TBOResponse, FlightDetails, FlightSegment } from '../../../../libs/interfaces/flight/search.interface';
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

      const trans = await this.fetchSegmentsDataAsPerJourneyType(response, assigned_journey_type)

      // const transform_flight_list = this.extractFlightData(response);

      return { message: "Flight list fetched successfully", data: trans };

    } catch (error) {
      console.log("Error in the search flight function", error);
      throw error;
    }
  }


  async  fetchSegmentsDataAsPerJourneyType(response, journey_type:number) {
    try {
      const flightList = {};
      const result = response.Response?.Results?.[0];
      const origin = response.Response?.Origin;
      const destination = response.Response?.Destination;
      const trace_id = response.Response?.TraceId;
      console.log("object", origin, destination, trace_id);
      if (!result) {
        console.error("Invalid response structure or empty Results.");
        throw `("result is empty")`;
      }
     
      
      if (journey_type === 1) {
        console.log("I am", journey_type)

        // result.map((element)=>{
        //   element.Segments
        // })
        // Domestic or International single segment
        // flightList['departure_flights'] = await this.segmentsFromResultArray(result);
        // console.log(">>", JSON.stringify(flightList[0]));
        // return flightList
        const segments = await this.segmentsFromResultArray(result);
        console.log("Segments for journeyType 1:", segments);
        return segments; // Ensure you're returning the result here
      }
  
      if (journey_type === 2) {
        if (result.length === 1) {
  
          const segment1 = await this.segmentsFromResultArray(result);
          const segment2 = await this.segmentsFromResultArray(result[0]?.Segments?.[1]);

          flightList['departure_flights'] = segment1;

          flightList['arrival_flights'] = segment2;

        } else {

          const segment1 = await this.segmentsFromResultArray(result[0]?.Segments?.[0])
          const segment2 = await this.segmentsFromResultArray(result[1]?.Segments?.[0])
  
          flightList['departure_flights'] = segment1;
          flightList['arrival_flights'] = segment2
        }
        return flightList;
      }
  
      if (journey_type === 3) {
        // Domestic or International multiple segments
        const segment = await this.segmentsFromResultArray(result[0]?.Segments);
        return segment;
      }
  
      // If journey_type is invalid
      throw new Error("Invalid journey type provided");
    } catch (error) {
      console.error("Error in fetchSegmentsDataAsPerJourneyType:", error.message);
      throw new Error("Invalid travel type or data structure");
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

  async segmentsFromResultArray(result) {
    if (!Array.isArray(result)) {
      throw new Error("Invalid input: 'result' must be an array.");
    }
  
    const flight_listing = result.flatMap(element =>
      Array.isArray(element.Segments)
        ? element.Segments.map(segment => segment) // Process segments
        : []
    );
  
    return flight_listing;
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
