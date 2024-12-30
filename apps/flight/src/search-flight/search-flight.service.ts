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

      const trans = this.fetchSegmentsDataAsPerJourneyType(response, assigned_journey_type)
   
      // const transform_flight_list = this.extractFlightData(response);

      return { message: "Flight list fetched successfully", data: trans };

    } catch (error) {
      console.log("Error in the search flight function", error);
      throw error;
    }
  }


  private fetchSegmentsDataAsPerJourneyType(response, journey_type) {
    try {
      
      const result = response.Response.Results[0];
      // console.log(journey_type);
      if (journey_type === 1) {
        // Domestic or International
        // console.log("result", isArray(result));
        // const flightList =  result[0].Segments[0];
        const flightList =  this.segmentsFromResultArray(result);
        
  
        return flightList
      }

      if (journey_type === 2) {
        if (result.length == 1) {
          //internationation flight
          const incoming_flight_list = result[0].Segments[0];
          const outgoing_flight_list = result[0].Segments[1];
          return { incoming_flight_list, outgoing_flight_list };
        } else {
          const incoming_flight_list = result[0].Segments[0];
          const outgoing_flight_list = result[1].Segments[0];

          return { incoming_flight_list, outgoing_flight_list };
        }
      }

      if (journey_type === 3) {
        // Domestic or International
        return result[0].Segments;
      }
      // return result;

    } catch (error) {
      console.log("Error in segment type ", error);
      throw ('Invalid travel type or data structure');
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

  private segmentsFromResultArray(result){
    let flight_listing = [];
    flight_listing = result.map((element)=>{
      // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<"< JSON.stringify(element));
      return flight_listing.push(element);
    })
    return flight_listing
  }
}  
