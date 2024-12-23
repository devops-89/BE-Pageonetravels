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

export interface JourneyType {
    ONE_WAY:1,
    RETURN : 2,
    MULTI_STOP: 3,
    ADVANCE_SEARCH: 4,
    SPECIAL_RETURN:5
}

export interface Multicity  {
  origin: string;         
  destination: string;
  cabin_class:string;     
  departure_date: string;   // The departure date in YYYY-MM-DD format
  preferred_time: string;             // The time in HHMM format
};

export interface TimeFilter {
  "AnyTime" : '00:00:00';
  "Morning" : '08:00:00'; 
  "AfterNoon" : '14:00:00';
  "Evening" : '19:00:00';
  "Night" : '01:00:00';
}
