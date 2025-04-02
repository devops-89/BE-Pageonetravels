export declare namespace ApiResponse {
  interface ApiResponseType {
    data: any,
    statusCode: number,
    message: string,
    extraError?: any,
    extraMessage?: any,
    success?: boolean

  }

  interface ApiOK {
    data?: any,
    statusCode?: number,
    message?: string,
    extraMessage?: any
    success?: boolean
  }



  export interface FlightResponse {
    Response: {
      TraceId: string;
      Results: FlightResult[][];
    };
  }

  export interface FlightResult {
    ResultIndex: string;
    Segments: FlightSegment[][];
    IsRefundable: boolean;
    IsLCC: boolean;
    Fare: {
      PublishedFare: number;
    };
  }

  interface FlightSegment {
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
  
  interface FlightDetails {
    TraceID: string;
    ResultIndex: string;
    TotalJourneyDuration: number;
    IsRefundable: string;
    IsLCC: string;
    SeatsAvailable: number;
    FlightPrice: number;
    SegmentDetails: FlightSegment[];
  }
  
  interface TBOResponse {
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
          NoOfSeatAvailable?: number;
        }>>;
        IsRefundable: boolean;
        IsLCC: boolean;
        Fare: { PublishedFare: number };
      }>>;
    };
  }
  

  export interface ApiErrorType {
    statusCode: number;
    message: string;
    extraError?: any;
    stack?: string;
    name?:string
  }
  export interface FlightData {
    TraceID: string;
    ResultIndex: string;
    TotalJourneyDuration: number;
    IsRefundable: string;
    IsLCC: string;
    SeatsAvailable: number;
    FlightPrice: number;
    SegmentDetails: {
      Departure: string;
      Arrival: string;
      DepartureTime: string;
      ArrivalTime: string;
      FlightName: string;
      FlightNumber: string;
      AirlineCode: string;
      FlightImage: string | null;
      Duration: number;
      NoOfSeatAvailable: number;
    }[];
  }
}



