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
  