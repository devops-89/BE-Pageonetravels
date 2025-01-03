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
  
  export interface IHotelSearch {
    city: string;
    checkInDate: string; 
    checkOutDate: string; 
    adultCount: number; 
    childCount: number;  
    roomTypes?: string[]; 
    preferredHotelBrand?: string; 
    rating?: number; 
    preferredAmenities?: string; 
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
    checkInDate: string;
    checkOutDate: string;
  }
  
  export interface HotelSearchResponse {
    message: string;
    data: HotelDetails[];
    statusCode: number;
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
  