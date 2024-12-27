import { TimeFilter, JOURNEY_TYPE } from '../../../libs/constants/flightConstant';

export interface IFlightSearch {
  EndUserIp: string;
  TokenId: any;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  DirectFlight?: boolean;         // Optional
  OneStopFlight: boolean;
  JourneyType?: any;           // Optional
  PreferredAirlines?: string;     // Optional
  Segments: {
    Origin: string;
    Destination: string;
    FlightCabinClass: any;
    PreferredDepartureTime: string;
    PreferredArrivalTime: string;
  }[];
  Sources?: string[] | null;      // Optional
}



  
 
export interface CabinClass {
    ALL: 1,
    ECONOMY:2,
    PREMIUM_ECONOMY:3,
    BUSINESS:4,
    PREMIUM_BUSINESS:5,
    FIRST_CLASS : 6,
}

export interface Multicity  {
  origin: string;         
  destination: string;
  cabin_class:string;     
  departure_date: string;   
  preferred_time: any;           
};

export type AirportType = {
  id: string;         
  created_at: Date;   
  iata_code: string;    
  airport_name: string; 
  city_name: string;   
  city_code: string;   
  country_code: string;
};


export interface MulticityItem {
  origin: string;
  destination: string;
  cabin_class: string;
  departure_date: string;
  preferred_time?: string; // Optional, as it is commented in the original code
}

export interface ISearchFlight {
  min_price?: string;
  max_price?: string;
  ip_address: string;
  origin: string;
  destination: string;
  departure_date: string;
  preferred_time: string;
  return_date?: string;
  multicity?: any;
  journey_type: number;
  adult: number;
  child?: number;
  infant?: number;
  cabin_class: string;
  direct_flight?: boolean;
  one_stop_flight?: boolean;
}

export interface IFareRule {
  "EndUserIp":string,
  "TokenId": string,
  "TraceId": string,
  "ResultIndex": string
}

export interface FlightSegment {
  Departure: string;
  Arrival: string;
  DepartureTime: string;
  ArrivalTime: string;
  FlightName: string;
  FlightNumber: string;
  AirlineCode: string;
  FlightImage: string | null;
  Duration: number;
  NoOfSeatAvailable?: number;
}

export interface FlightDetails {
  TraceID: string;
  ResultIndex: string;
  TotalJourneyDuration: number;
  IsRefundable: string;
  IsLCC: string;
  SeatsAvailable: number;
  FlightPrice: number;
  SegmentDetails: FlightSegment[];
}

export interface TBOResponse {
  Response: {
    Results: Array<Array<{
      TraceId: string;
      ResultIndex: string;
      Segments: Array<Array<{
        Origin: { Airport: { CityName: string; AirportCode: string }; DepTime: string };
        Destination: { Airport: { CityName: string; AirportCode: string }; ArrTime: string };
        Airline: { AirlineName: string; FlightNumber: string; AirlineCode: string };
        Craft?: string;
        Duration: number;
        NoOfSeatAvailable?: number; // Optional property
      }>>;
      IsRefundable: boolean;
      IsLCC: boolean;
      Fare: { PublishedFare: number };
    }>>;
  };
}