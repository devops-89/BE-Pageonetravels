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
  }
  

  export interface IHotelSearchPayload {
    EndUserIp: string;
    TokenId: string;
    CheckInDate: string;
    CheckOutDate: string;
    City: string;
    NoOfRooms: number;
    AdultCount: number;
    ChildCount?: number;
    PreferredHotelBrand?: string;
    Rating?: number;
    PreferredAmenities?: string[];
  }

  export interface IHotelSearch {
    city: string;
    check_in_date: string;
    check_out_date: string;
    adult_count: number;
    child_count?: number;
    roomTypes?: string[];
    preferredHotelBrand?: string;
    rating?: number;
    ip_address:string;
    preferredAmenities?: string[];
  }
  
  export interface HotelDetails {
    hotelName: string;
    hotelId: string;
    city: string;
    country: string;
    rating: number;
    pricePerNight: number;
    amenities: string[];
    availableRooms: number;
    roomType: string;
    totalPrice: number;
    check_in_date: string;
    check_out_date: string;
  }
  
  export interface HotelSearchResponse {
    Response: any;
    message: string;
    data: HotelDetails[];
    statusCode: number;
  }

  export interface IFareRule {
    "EndUserIp":string,
    "TokenId": string,
    "TraceId": string,
    "ResultIndex": string
  }
  
  

  // export interface IHotelSearch {
  //   EndUserIp: string;
  //   TokenId: any;
  //   RoomCount: number;
  //   AdultCount: number;
  //   ChildCount: number;
  //   CheckInDate: string;
  //   CheckOutDate: string;
  //   HotelType?: string; // Optional, for different types of hotels
  //   PreferredLocation?: string; // Optional, location of the hotel (city, area, etc.)
  //   RoomType?: string; // Optional, specific room type preference
  //   BedType?: string; // Optional, bed type preference
  //   Sources?: string[] | null; // Optional, specific sources
  // }
  
  // export interface HotelDetails {
  //   HotelName: string;
  //   HotelCode: string;
  //   Address: string;
  //   City: string;
  //   Country: string;
  //   StarRating: number;
  //   Price: number;
  //   AvailableRooms: number;
  //   Facilities: string[];
  //   Image: string | null;
  // }
  
  // export interface HotelResponse {
  //   Response: {
  //     Results: Array<{
  //       HotelName: string;
  //       HotelCode: string;
  //       Address: string;
  //       City: string;
  //       Country: string;
  //       StarRating: number;
  //       Price: number;
  //       AvailableRooms: number;
  //       Facilities: string[];
  //       Image: string | null;
  //     }>;
  //   };
  // }
  