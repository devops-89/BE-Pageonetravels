export interface HotelType {
  id: string;
  name: string;
  location: string;
  city: string;
  price: number;
  rating: number;
  available_rooms: number;
  amenities: string[];
}

export interface TBOHotelResponse {
  Response: {
    Results: Array<{
      name: string;
      location: string;
      price: number;
      rating: number;
      available_rooms: number;
      amenities: string[];
    }>;
  };



}export interface IHotelSearchPayload {
  EndUserIp: string;
  TokenId: string;
  CheckInDate: string;
  CheckOutDate: string;
  City: string;
  NoOfRooms: number;
  AdultCount: number;
  ChildCount: number;
  PreferredHotelBrand?: string | null;
  Rating?: number | null;
  PreferredAmenities?: string[] | null;
}

export interface IFareRule {
  TokenId: string;
  HotelCode: string;
  RoomCode: string;
  EndUserIp: string;
}

export interface ICountry {
  Code: string;
  Name: string;
}

export interface ICity {
  Id: string;
  Name: string;
  CountryCode: string;
}

// export interface HotelType {
//     id: string;
//     name: string;
//     location: string;
//     city: string;
//     price: number;
//     rating: number;
//     available_rooms: number;
//     amenities: string[];
//   }
  
//   export interface TBOHotelResponse {
//     Response: {
//       Results: Array<{
//         name: string;
//         location: string;
//         price: number;
//         rating: number;
//         available_rooms: number;
//         amenities: string[];
//       }>;
//     };
//   }
  

//   export interface IHotelSearchPayload {
//     EndUserIp: string;
//     TokenId: string;
//     CheckInDate: string;
//     CheckOutDate: string;
//     City: string;
//     NoOfRooms: number;
//     AdultCount: number;
//     ChildCount?: number;
//     PreferredHotelBrand?: string;
//     Rating?: number;
//     PreferredAmenities?: string[];
//   }

//   export interface IHotelSearch {
//     city: string;
//     check_in_date: string;
//     check_out_date: string;
//     adult_count: number;
//     child_count?: number;
//     roomTypes?: string[];
//     preferredHotelBrand?: string;
//     rating?: number;
//     ip_address:string;
//     preferredAmenities?: string[];
//   }
  
//   export interface HotelDetails {
//     hotelName: string;
//     hotelId: string;
//     city: string;
//     country: string;
//     rating: number;
//     pricePerNight: number;
//     amenities: string[];
//     availableRooms: number;
//     roomType: string;
//     totalPrice: number;
//     check_in_date: string;
//     check_out_date: string;
//   }
  
//   export interface HotelSearchResponse {
//     Response: any;
//     message: string;
//     data: HotelDetails[];
//     statusCode: number;
//   }

//   export interface IFareRule {
//     "EndUserIp":string,
//     "TokenId": string,
//     "TraceId": string,
//     "ResultIndex": string
//   }

