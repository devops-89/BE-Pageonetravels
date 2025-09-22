import { Inject, Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelCountryRepositoryService } from '../../../../libs/database/src/repositories/hotelCountry.repository';
import { CommissionRepositoryService } from '../../../../libs/database/src/repositories/commission.repository';
import { HotelDetailsRepositoryService } from '../../../../libs/database/src/repositories/hotelDetails.repository';
import { HotelCityRepositoryService } from '../../../../libs/database/src/repositories/hotelCity.repository';
import { OrderRepositoryService } from '../../../../libs/database/src';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { CreateHotelBookingDto, CreateBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import { HotelDetailDto } from 'libs/dtos/hotel/search-hotel.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';

@Injectable()
export class SearchHotelService {
    constructor(
        private readonly hotelTBOAPIService: HotelTBOAPIService,
        private readonly commissionRepositoryService: CommissionRepositoryService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly orderRepository: OrderRepositoryService,
        private readonly hotelCountryRepositoryService: HotelCountryRepositoryService,
        private readonly hotelDetailsRepositoryService: HotelDetailsRepositoryService,
        private readonly hotelCityRepositoryService: HotelCityRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly rediscacheservice: RedisCacheService
    ) {}

    async searchCountry() {
        try {
            const country_list_from_cache = (await this.rediscacheservice.getCache('CountryList')) as string;

            if (country_list_from_cache) {
                return { message: 'Country list sent successfully', data: JSON.parse(country_list_from_cache) };
            }

            const country_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList';

            const country_list = await this.hotelTBOAPIService.fetchCountryList(country_search_base_url);
            if (country_list.Status.Code === 200) {
                await this.hotelCountryRepositoryService.createCountry(country_list.CountryList);
            }

            if (country_list && country_list.length) {
                await this.rediscacheservice.setCache('CountryList', JSON.stringify(country_list), 88000);
            }

            return {
                message: 'Country list fetched successfully',
                data: country_list,
            };
        } catch (error) {
            console.error('Error in searchCountry:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the country list.');
        }
    }

    async searchCity() {
        try {
            const city_list_from_cache = (await this.rediscacheservice.getCache('CityList')) as string;

            if (city_list_from_cache) {
                return { message: 'Country list sent successfully', data: JSON.parse(city_list_from_cache) };
            }

            const countryCodes = await this.hotelCountryRepositoryService.getCountryCode();

            const city_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList';

            const city_list = await this.hotelTBOAPIService.fetchCityList(city_search_base_url, countryCodes);

            if (city_list && city_list.length) {
                await this.rediscacheservice.setCache('CityList', JSON.stringify(city_list), 88000);
            }

            return { message: 'Country list fetched successfully', data: city_list };
        } catch (error) {
            console.error('Error in searchCountry:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the country list.');
        }
    }

    async ClientHotelDetails(body:HotelDetailDto){
        try{
            const hotel_details=await this.hotelTBOAPIService.fetchClientHotelDetails(body);
             return { message: 'Hotel Details fetched successfully', data: hotel_details };
        }
        catch(error){
             console.error('Error in HotelDetails:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the hotel details.');
        }
    }

    async HotelDetails(body) {
        try {
            const { hotel_city_code } = body;

            const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';
            const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);
            console.log('>>>>>>', code_list);

            const hotelDetailsList = [];
            for (const city of code_list.HotelCodes) {
                const hotel_details_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails';
                const hotel_details = await this.hotelTBOAPIService.fetchHotelDetails(hotel_details_base_url, city);
                console.log('>>>>>>>>>>> >>>> >', hotel_details);
                hotelDetailsList.push(hotel_details);
            }

            return { message: 'Hotel Details fetched successfully', data: hotelDetailsList };
        } catch (error) {
            console.error('Error in HotelDetails:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the hotel details.');
        }
    }
    async CityHotelDetails(body) {
        try {
            const { city_code } = body;

            const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';

            const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, city_code);

            return { message: 'Hotel Details fetched successfully', data: hotel_details };
        } catch (error) {
            console.error('Error in CityHotelDetails:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the city hotel details.');
        }
    }

    async HotelCityCodeList() {
        try {
            const hotel_code_list = (await this.rediscacheservice.getCache('HotelCityCodes')) as string;

            if (hotel_code_list) {
                return { message: 'Hotel city codes sent successfully', data: JSON.parse(hotel_code_list) };
            }

            const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';

            const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);

            if (code_list && code_list.length) {
                await this.rediscacheservice.setCache('HotelCityCodes', JSON.stringify(code_list), 88000);
            }

            return { message: 'Hotel Code list fetched successfully', data: code_list };
        } catch (error) {
            console.error('Error in HotelCityCodeList:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the hotel city code list.');
        }
    }

    // main search hotel api
        async searchHotel(body) {
            try {
                const allResponses = [];

                const city_hotel_details_api = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
                console.log('++++++++++++++++++++++++++++body payload:', body);
                const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details_api, body.CityCodes);
                console.log('++++++++++++++++++++++++++++hotel_details:', hotel_details.Hotels);
                const { CountryCode } = hotel_details.Hotels[0];
                const commissionType = await this.commissionRepositoryService.getCommissionbytype(CountryCode === 'IN' ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL);
                const hotel_code = hotel_details.Hotels.map((hotel) => hotel.HotelCode);

                const chunksArray = this.createAChunkArray(hotel_code, 80);
                console.log("Chunk Array of 80: ",chunksArray[0]);

               // Step 1: Prepare all payloads for each chunk
    const chunkedPayloads = chunksArray.map((chunk) => ({
      CheckIn: body.CheckIn,
      CheckOut: body.CheckOut,
      HotelCodes: chunk.join(","),
      GuestNationality: body.GuestNationality,
      EndUserIp: body.EndUserIp,
      PaxRooms: body.PaxRooms.map((room) => {
        const copy = { ...room };
        if (copy.Children === 0) delete copy.ChildrenAges;
        return copy;
      }),
      ResponseTime: body.ResponseTime,
      IsDetailedResponse: body.IsDetailedResponse,
      ...(body.Filters && Object.values(body.Filters).some((v) => v) && {
        Filters: body.Filters,
      }),
    }));

    // Step 2: Fire all chunked requests in parallel
    const allRequests = chunkedPayloads.map((payload) =>
      this.fetchHotelData(payload)
    );

    const results = await Promise.allSettled(allRequests);

    // Step 3: Merge results
    results.forEach((result) => {
      if (result.status === "fulfilled" && result.value?.Status?.Code === 200) {
        result.value.HotelResult.forEach((hotel) => {
          const meta = hotel_details.Hotels.find(
            (h) => h.HotelCode === hotel.HotelCode
          );
          allResponses.push({ ...hotel, ...meta });
        });
      }
    });

    return {
      message: "Hotel Search List fetched successfully",
      data: allResponses,
      commission: commissionType,
    };

            } catch (error) {
                console.error('Error in searchHotel:', error);
                throw error;
            }
        }

    // first chuck payload and response
//    async searchHotel(body) {
//   try {
//     const cityHotelDetailsUrl = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';

//     // Step 1: Fetch hotel metadata for the city
//     const hotelDetails = await this.hotelTBOAPIService.fetchCityHotelDetails(cityHotelDetailsUrl, body.CityCodes);
//     const { CountryCode } = hotelDetails.Hotels[0];

//     // Step 2: Determine commission type based on country
//     const commissionType = await this.commissionRepositoryService.getCommissionbytype(
//       CountryCode === 'IN' ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL
//     );

//     // Step 3: Extract hotel codes and chunk them
//     const hotelCodes = hotelDetails.Hotels.map(hotel => hotel.HotelCode);
//     const chunksArray = this.createAChunkArray(hotelCodes, 80);
//     const firstChunk = chunksArray[0];

//     // Step 4: Build payload for the first chunk
//     const firstPayload = {
//       CheckIn: body.CheckIn,
//       CheckOut: body.CheckOut,
//       HotelCodes: firstChunk.join(','),
//       GuestNationality: body.GuestNationality,
//       EndUserIp: body.EndUserIp,
//       PaxRooms: body.PaxRooms.map(room => {
//         const copy = { ...room };
//         if (copy.Children === 0) delete copy.ChildrenAges;
//         return copy;
//       }),
//       ResponseTime: body.ResponseTime,
//       IsDetailedResponse: body.IsDetailedResponse,
//       ...(body.Filters && Object.values(body.Filters).some(v => v) && { Filters: body.Filters }),
//     };

//     // Step 5: Fetch hotel data for the first chunk
//     const firstChunkResponse = await this.fetchHotelData(firstPayload); // Should return response.data only

//     // Step 6: Merge hotel metadata with response
//     const enrichedHotels = [];
//     if (firstChunkResponse?.Status?.Code === 200) {
//       firstChunkResponse.HotelResult.forEach(hotel => {
//         const meta = hotelDetails.Hotels.find(h => h.HotelCode === hotel.HotelCode);
//         enrichedHotels.push({ ...hotel, ...meta });
//       });
//     }

//     // Step 7: Return structured response
//     return {
//       message: 'Hotel Search List fetched successfully (First Chunk Only)',
//       payload: firstPayload,
//       response: firstChunkResponse, // Raw TBO API response
//       data: enrichedHotels,
//       commission: commissionType,
//     };
//   } catch (error) {
//     console.error('❌ Error in searchHotel (First Chunk):', error?.message || error);
//     throw error;
//   }
// }

// formated payload , request, response with all the chunks
// async searchHotel(body) {
//   try {
//     const cityHotelDetailsUrl =
//       'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';

//     // Step 1: Fetch hotel metadata for the city
//     const hotelDetails = await this.hotelTBOAPIService.fetchCityHotelDetails(
//       cityHotelDetailsUrl,
//       body.CityCodes,
//     );
//     const { CountryCode } = hotelDetails.Hotels[0];

//     // Step 2: Determine commission type based on country
//     const commissionType =
//       await this.commissionRepositoryService.getCommissionbytype(
//         CountryCode === 'IN'
//           ? COMMISSION_TYPE.HOTEL_DOMESTIC
//           : COMMISSION_TYPE.HOTEL_INTERNATIONAL,
//       );

//     // Step 3: Extract hotel codes and chunk them
//     const hotelCodes = hotelDetails.Hotels.map((hotel) => hotel.HotelCode);
//     const chunksArray = this.createAChunkArray(hotelCodes, 80);

//     // Arrays to collect results across all chunks
//     const allPayloads = [];
//     const allResponses = [];
//     const enrichedHotels = [];

//     // Step 4: Loop over all chunks
//     for (const chunk of chunksArray) {
//       const chunkPayload = {
//         CheckIn: body.CheckIn,
//         CheckOut: body.CheckOut,
//         HotelCodes: chunk.join(','),
//         GuestNationality: body.GuestNationality,
//         EndUserIp: body.EndUserIp,
//         PaxRooms: body.PaxRooms.map((room) => {
//           const copy = { ...room };
//           if (copy.Children === 0) delete copy.ChildrenAges;
//           return copy;
//         }),
//         ResponseTime: body.ResponseTime,
//         IsDetailedResponse: body.IsDetailedResponse,
//         ...(body.Filters &&
//           Object.values(body.Filters).some((v) => v) && {
//             Filters: body.Filters,
//           }),
//       };

//       // Save payload for debugging/logging
//       allPayloads.push(chunkPayload);

//       // Step 5: Fetch hotel data for the current chunk
//       const chunkResponse = await this.fetchHotelData(chunkPayload);
//       allResponses.push(chunkResponse);

//       // Step 6: Merge hotel metadata with response
//       if (chunkResponse?.Status?.Code === 200) {
//         chunkResponse.HotelResult.forEach((hotel) => {
//           const meta = hotelDetails.Hotels.find(
//             (h) => h.HotelCode === hotel.HotelCode,
//           );
//           enrichedHotels.push({ ...hotel, ...meta });
//         });
//       }
//     }

//     // Step 7: Return aggregated structured response
//     return {
//       message: 'Hotel Search List fetched successfully (All Chunks)',
//       payload: allPayloads, // Array of all payloads sent
//       response: allResponses, // Array of raw TBO API responses
//       data: enrichedHotels, // Aggregated enriched hotel data
//       commission: commissionType,
//     };
//   } catch (error) {
//     console.error('❌ Error in searchHotel (All Chunks):', error?.message || error);
//     throw error;
//   }
// }

    async preBook(body) {
        try {
            const hotel_prebook_url = 'https://affiliate.tektravels.com/HotelAPI/PreBook';
            const data = body.BookingCode;
            const response = await this.hotelTBOAPIService.handlePreBook(hotel_prebook_url, data);
            return { message: 'Hotel Pre Book fetched successfully', data: response };
        } catch (error) {
            console.log('Error in PreBook', error);
            throw error;
        }
    }

    async getCitylist() {
        const CACHE_KEY = 'cityData';

        try {
            const cachedCities = await this.cacheManager.get(CACHE_KEY);

            if (cachedCities) {
                console.log('Returning data from Redis cache');
                return {
                    message: 'Hotel City list fetched successfully from cache',
                    data: cachedCities,
                };
            }

            console.log('Data not in cache - fetching from database');
            const freshData = await this.hotelCityRepositoryService.getAllCities();

            await this.cacheManager.set(CACHE_KEY, freshData);

            return {
                message: 'Hotel City list fetched successfully from database',
                data: freshData,
            };
        } catch (error) {
            console.error('Error in getCitylist:', error);
            throw error;
        }
    }

    async fetchDetails() {
        try {
            const citylist = await this.hotelDetailsRepositoryService.fetchcity();
            console.log(citylist);
            for (const cityCode of citylist) {
                const hotelcityDetails = await this.hotelDetailsRepositoryService.fetchDetails(cityCode);
                await this.cacheManager.set(cityCode, hotelcityDetails);
                console.log('stored data in cache database', cityCode);
            }

            return { message: 'Hotel Details set successfully', data: citylist };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async bookingHotel(body: CreateHotelBookingDto, reference_id: string) {
        try {
            console.log('📦 Booking Request Payload:', body);

            // 1. Insert booking request to DB first (for logging/tracking)
            const order_type = 'HOTEL';
            const amount = body.NetAmount.toString();
            const is_LCC = '';
            const journey = '';
            const journey_type = '';

            const savedOrder = await this.orderRepository.insertBooking(reference_id, order_type, body, amount, is_LCC, journey, journey_type, 'FIXED', '350.00');
            console.log('💾 Order Saved:', savedOrder);

            // 2. Call TBO Booking API
            const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/book/';
            const tboBookingResponse = await this.hotelTBOAPIService.hotelBook(url, body); //  actual booking API call

            // 3. Return the response from TBO
            return tboBookingResponse;
        } catch (error) {
            console.error('❌ Booking failed:', error);
            throw error;
        }
    }

    async bookingDetails(body: CreateBookingDto) {
        try {
            const url = 'http://HotelBE.tektravels.com/internalhotelservice.svc/rest/GetBookingDetail';
            const result = await this.hotelTBOAPIService.hotelBookingDetails(url, body);

            return result;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    createAChunkArray(array, chunkSize) {
        const result = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            result.push(array.slice(i, i + chunkSize));
        }
        return result;
    }

    async fetchHotelData(payload) {
        try {
            const username = 'Pageone';
            const password = 'Pageone@1234';
            const credentials = Buffer.from(`${username}:${password}`).toString('base64');

            const headers = {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/json',
            };

            // const baseURL = "https://affiliate.tektravels.com/HotelAPI/Search";
            const baseURL = 'https://affiliate.tektravels.com/HotelAPI/Search';

            const config = { headers };
            const result = await axios.post(baseURL, payload, config);
            console.log('++++++++++++++++++++++++++++++++++++++Hotel Search Data: ', result);
            return result.data;
        } catch (error) {
            console.error(`Error fetching data for ${payload.HotelCodes}:`, error.message);
            throw error;
        }
    }

    async sendChangeRequest(BookingId: number, Remarks: string, ip_address: string) {
        // Get dynamic token using the provided IP address
        const { token } = await this.generateTokenService.getToken(ip_address);

        const payload = {
            EndUserIp: ip_address,
            TokenId: token,
            BookingId,
            RequestType: 4, // HotelCancel
            Remarks,
        };

        const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/SendChangeRequest';
        const response = await axios.post(url, payload);

        const result = response.data?.HotelChangeRequestResult;

        if (result?.ResponseStatus === 1) {
            return result; // success
        } else {
            throw new Error(result?.Error?.ErrorMessage || 'Cancellation request failed');
        }
    }

    // Check Cancellation Status (GetChangeRequestStatus)
    async getChangeRequestStatus(ChangeRequestId: number, ip_address: string) {
        const { token } = await this.generateTokenService.getToken(ip_address);

        const payload = {
            EndUserIp: ip_address,
            TokenId: token,
            ChangeRequestId,
        };

        const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/GetChangeRequestStatus';
        const response = await axios.post(url, payload);
        const result = response.data.HotelChangeRequestStatusResult;
        console.log('Cancel Status: ', result);

        if (result.ResponseStatus === 1) {
            return result;
        } else {
            throw new Error(result.Error?.ErrorMessage || 'Cancellation status check failed');
        }
    }
}
