import { Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelSearchDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { HotelSearchResponse } from '../../../../libs/interfaces/hotel/search.interface';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';

@Injectable()
export class SearchHotelService {
  constructor(
    private readonly generateTokenService: GenerateTokenService,
    private readonly hotelTBOAPIService: HotelTBOAPIService,
  ) {}


  async searchHotel(body: HotelSearchDto): Promise<HotelSearchResponse> {
    try {
      const {
        check_in_date,
        check_out_date,
        adult_count,
        child_count,
        ip_address,
        country_code,
        city,
        preferred_currency,
        guest_nationality,
        room_guests,
        result_count = 10,
        max_rating = 5, 
        min_rating = 1, 
        token_id,
      } = body;

    
      this.validateSearchRequest(body);


      const token = token_id || await this.generateTokenService.generateHotelToken(ip_address);

      const noOfNights = this.calculateNoOfNights(check_in_date, check_out_date).toString(); // Convert to string

      const payload = {
        EndUserIp: ip_address,
        TokenId: token,
        CheckInDate: this.formatDate(check_in_date),
        CheckOutDate: this.formatDate(check_out_date),
        NoOfNights: noOfNights, 
        CountryCode: country_code,
        CityId: city, 
        NoOfRooms: room_guests.length.toString(),
        AdultCount: adult_count,
        ChildCount: child_count,
        IsTBOMapped: 'true', 
        ResultCount: result_count.toString(), // Convert result_count to a string
        PreferredCurrency: preferred_currency,
        GuestNationality: guest_nationality,
        MaxRating: max_rating,
        MinRating: min_rating,
        ReviewScore: 0,
        IsNearBySearchAllowed: false,
        RoomGuests: room_guests.map((guest) => ({
          NoOfAdults: guest.no_of_adults.toString(),
          NoOfChild: guest.no_of_children.toString(),
          ChildAge: guest.child_ages ? guest.child_ages.map(age => age.toString()) : [],
        })),
      };

      // API call to fetch hotel search results
      console.log("Request payload:", payload);
      const response = await this.hotelTBOAPIService.searchHotelAPI(token, process.env.HOTEL_SEARCH, payload);
      console.log("Request payload:", payload);

      // Return the parsed response
      return this.parseHotelResponse(response);
    } catch (error) {
      console.error('Error in searchHotel:', error);
      throw new Error('Error during hotel search: ' + error.message);
    }
  }

  // Utility to format date to MM/DD/YYYY
  private formatDate(date: string): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;
  }

  private calculateNoOfNights(checkInDate: string, checkOutDate: string): number {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const timeDifference = checkOut.getTime() - checkIn.getTime();
    return timeDifference / (1000 * 3600 * 24); // Convert time difference to days
  }

  // Parse the hotel search response
  private parseHotelResponse(responseData): HotelSearchResponse {
    if (responseData.HotelSearchResult.ResponseStatus !== 1) {
      throw new Error(`API Error: ${responseData.HotelSearchResult.Error.ErrorMessage}`);
    }

    const hotels = responseData.HotelSearchResult.HotelResults.map((hotel) => ({
      hotelCode: hotel.HotelCode,
      hotelName: hotel.HotelName,
      starRating: hotel.StarRating,
      description: hotel.HotelDescription,
      hotelImage: hotel.HotelPicture,
      price: this.formatPrice(hotel.Price),
      location: hotel.HotelAddress,
      hotelPolicy: hotel.HotelPolicy || 'No cancellation policy found.',
      contact: hotel.HotelContactNo || 'No contact details available',
      tripAdvisor: {
        rating: hotel.TripAdvisor?.Rating,
        reviewUrl: hotel.TripAdvisor?.ReviewURL,
      },
    }));

    return { hotels };
  }

  // Format the price to include the currency symbol
  private formatPrice(price): string {
    return `${price.Amount} ${price.CurrencyCode}`;
  }

  // Validate the search request input
  private validateSearchRequest(body: HotelSearchDto) {
    if (body.adult_count < 1) {
      throw new Error('At least one adult is required.');
    }
    if (body.adult_count < body.child_count) {
      throw new Error('Number of adults should be greater than or equal to children.');
    }
    if (new Date(body.check_in_date) >= new Date(body.check_out_date)) {
      throw new Error('Check-out date must be after check-in date.');
    }
  }
}
