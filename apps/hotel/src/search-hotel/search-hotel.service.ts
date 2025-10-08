import { Inject, Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
// import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelTboCodeRepositoryService } from '../../../../libs/database/src/repositories/hoteltbocode.repository';
import { HotelCountryRepositoryService } from '../../../../libs/database/src/repositories/hotelCountry.repository';
import { CommissionRepositoryService } from '../../../../libs/database/src/repositories/commission.repository';
import { HotelDetailsRepositoryService } from '../../../../libs/database/src/repositories/hotelDetails.repository';
import { HotelCityRepositoryService } from '../../../../libs/database/src/repositories/hotelCity.repository';
import { OrderRepositoryService } from '../../../../libs/database/src';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { CreateHotelBookingDto } from '../../../../libs/dtos/hotel/hotel-booking.dto';
import { HotelDetailDto, GetBookingDetailDto } from '../../../../libs/dtos/hotel/search-hotel.dto';

import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { ORDER_STATUS } from '../../../../libs/constants/bookingContant';

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
        private readonly hotelTboCodeRepositoryService: HotelTboCodeRepositoryService,
        private readonly rediscacheservice: RedisCacheService
    ) {}

    //  fetch all countries from my database
    async searchCountry() {
        try {
            const countryList = await this.hotelCountryRepositoryService.getCountryCode();
            return {
                message: 'Country list fetched successfully',
                data: countryList,
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

    async ClientHotelDetails(body: HotelDetailDto) {
        try {
            const hotel_details = await this.hotelTBOAPIService.fetchClientHotelDetails(body);
            return { message: 'Hotel Details fetched successfully', data: hotel_details };
        } catch (error) {
            console.error('Error in HotelDetails:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the hotel details.');
        }
    }

    async HotelDetails() {
        try {
            // const { hotel_city_code } = body;

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
    // main search hotel api
    async searchHotel(body) {
        try {
            const allResponses = [];

            const city_hotel_details_api = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
            console.log('++++++++++++++++++++++++++++body payload:', body);

            // Get hotel list for the city
            const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details_api, body.CityCodes);
            console.log('++++++++++++++++++++++++++++hotel_details:', hotel_details.Hotels.length);

            const { CountryCode } = hotel_details.Hotels[0];
            const commissionType = await this.commissionRepositoryService.getCommissionbytype(CountryCode === 'IN' ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL);

            // Extract hotel codes
            const hotel_code = hotel_details.Hotels.map((hotel) => hotel.HotelCode);

            // Split hotel codes into chunks of 100 (per TBO spec)
            const chunksArray = this.createAChunkArray(hotel_code, 100);
            console.log(`Total Chunks Created: ${chunksArray.length}`);

            // Step 1: Prepare payloads for each chunk
            const chunkedPayloads = chunksArray.map((chunk) => ({
                CheckIn: body.CheckIn,
                CheckOut: body.CheckOut,
                HotelCodes: chunk.join(','), // Comma-separated hotel codes
                GuestNationality: body.GuestNationality,
                EndUserIp: body.EndUserIp,
                PaxRooms: body.PaxRooms.map((room) => {
                    const copy = { ...room };
                    if (copy.Children === 0) delete copy.ChildrenAges;
                    return copy;
                }),
                ResponseTime: body.ResponseTime,
                IsDetailedResponse: body.IsDetailedResponse,
                ...(body.Filters &&
                    Object.values(body.Filters).some((v) => v) && {
                        Filters: body.Filters,
                    }),
            }));

            // Step 2: Fire all chunked requests in parallel
            console.log(`[${new Date().toISOString()}] Firing ${chunkedPayloads.length} parallel requests...`);

            const allRequests = chunkedPayloads.map((payload, i) => {
                console.log(`[${new Date().toISOString()}] Sending chunk ${i + 1} with ${payload.HotelCodes.split(',').length} hotels`);
                return this.fetchHotelData(payload);
            });

            const results = await Promise.allSettled(allRequests);

            // Step 3: Merge successful results
            results.forEach((result) => {
                if (result.status === 'fulfilled' && result.value?.Status?.Code === 200) {
                    result.value.HotelResult.forEach((hotel) => {
                        const meta = hotel_details.Hotels.find((h) => h.HotelCode === hotel.HotelCode);
                        allResponses.push({ ...hotel, ...meta });
                    });
                }
            });

            return {
                message: 'Hotel Search List fetched successfully',
                data: allResponses,
                commission: commissionType,
                totalHotels: allResponses.length,
                totalChunks: chunksArray.length,
            };
        } catch (error) {
            console.error('Error in searchHotel:', error);
            throw error;
        }
    }

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

    async bookingDetails(orderId: string, ip: string) {
        try {
            const url = 'https://hotelbe.tektravels.com/hotelservice.svc/rest/Getbookingdetail';

            // Fetch order details
            const orderDetails = await this.orderRepository.find(orderId);
            if (!orderDetails) {
                throw new Error(`Order not found for id: ${orderId}`);
            }

            // Generate token
            const { token } = await this.generateTokenService.getToken(ip);
            console.log('Order Details:', orderDetails, 'Token:', token);

            // Parse stored success response
            let parsedResponse: any = {};
            try {
                parsedResponse = JSON.parse(orderDetails.success_response || '{}');
            } catch (e) {
                throw new Error(`Invalid success_response JSON for order ${orderId}`);
            }

            // Prepare common response fields
            const commonResponse = {
                bookingStatus: orderDetails.status,
                paymentStatus: orderDetails.payment_status,
            };

            // If booking is completed, fetch booking details from external API
            if (orderDetails.status === ORDER_STATUS.COMPLETED) {
                const payload: GetBookingDetailDto = {
                    EndUserIp: ip,
                    TokenId: token,
                    BookingId: parsedResponse?.BookingId || 0,
                };

                const bookingDetails = await this.hotelTBOAPIService.hotelBookingDetails(url, payload);
                console.log('Hotel Booking Details from API:', bookingDetails);

                return {
                    ...commonResponse,
                    bookingDetails,
                };
            }

            // For incomplete bookings, return only status and payment info
            return commonResponse;
        } catch (error) {
            console.error('Error in bookingDetails:', error.message);
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

    async cancelBooking(body: { orderId: string; Remarks: string; ip: string }) {
        try {
            const { orderId, Remarks, ip } = body;

            // 1. Fetch order
            let orderDetails = await this.orderRepository.find(orderId);
            if (!orderDetails) {
                throw new Error('Order not found');
            }

            // 2. Parse success response (this contains BookingId)
            let parsedResponse: any = {};
            try {
                parsedResponse = JSON.parse(orderDetails.success_response || '{}');
            } catch (e) {
                throw new Error(`Invalid success_response JSON for order ${orderId}`);
            }

            // ✅ Ensure BookingId exists
            const bookingId = parsedResponse?.BookingId;
            if (!bookingId) {
                throw { statusCode: 400, message: 'BookingId missing in success_response' };
            }

            // 3. Get token
            const { token } = await this.generateTokenService.getToken(ip);

            // 4. Call hotel cancellation API
            const result = await this.hotelTBOAPIService.sendChangeRequest(bookingId, Remarks, ip, token);

            // 5. Update status if success
            if (result?.ResponseStatus === 1) {
                orderDetails = await this.orderRepository.updateOrderStatus(orderId, ORDER_STATUS.CANCELLING, result?.ChangeRequestId);
            }

            return result;
        } catch (error: any) {
            console.error('Error in cancelBooking:', error.message || error);
            throw error;
        }
    }

    // Check Cancellation Status (GetChangeRequestStatus)
    async checkCancelStatus(body: { orderId: string; ip: string }) {
        const { orderId, ip } = body;

        // 1. Fetch order
        const orderDetails = await this.orderRepository.find(orderId);
        const ChangeRequestId = orderDetails.ChangeRequestId;
        if (!orderDetails) {
            throw new Error('Order not found');
        }

        const { token } = await this.generateTokenService.getToken(ip);

        const payload = {
            BookingMode: 5,
            EndUserIp: ip,
            TokenId: token,
            ChangeRequestId,
        };

        const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/GetChangeRequestStatus';
        const response = await axios.post(url, payload);
        const result = response.data?.HotelChangeRequestStatusResult;

        if (!result) {
            throw new Error('No response from TBO SendChangeRequest API');
        }
        console.log('Cancel Status: ', result);

        if (result.ResponseStatus === 1) {
            switch (result.ChangeRequestStatus) {
                case 1:
                case 2:
                    orderDetails.status = ORDER_STATUS.CANCELLING;
                    break;
                case 3:
                    orderDetails.status = ORDER_STATUS.CANCELLED;
                    break;
                case 4:
                    orderDetails.status = ORDER_STATUS.REJECTED;
                    break;
                default:
                    orderDetails.status = ORDER_STATUS.UNKNOWN;
            }

          
            await this.orderRepository.save(orderDetails);

            return result;
        } else {
            throw new Error(result.Error?.ErrorMessage || 'Cancellation status check failed');
        }
    }

    // syncing services

    async syncCountryData() {
        const country_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CountryList';
        const country_list = await this.hotelTBOAPIService.fetchCountryList(country_search_base_url);
        if (country_list.Status.Code === 200) {
            await this.hotelCountryRepositoryService.createCountry(country_list.CountryList);
        }
        return country_list;
    }

    async syncCityData() {
        const countryCodes = await this.hotelCountryRepositoryService.getCountryCode();
        const city_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList';

        // Helper to remove duplicate city codes
        const removeDuplicateCities = (cities: any[]) => {
            const uniqueMap = new Map<string, any>();
            cities.forEach((city) => {
                if (!uniqueMap.has(city.Code)) {
                    uniqueMap.set(city.Code, city);
                }
            });
            return Array.from(uniqueMap.values());
        };

        const allPromises = countryCodes.map(async (country) => {
            try {
                const citiesResponse = await this.hotelTBOAPIService.fetchCityList(city_search_base_url, [country]);
                if (!citiesResponse || !citiesResponse[0]?.CityList?.length) {
                    console.log(`No cities for country: ${country.code}`);
                    return;
                }

                // Remove duplicate city codes
                const uniqueCities = removeDuplicateCities(citiesResponse[0].CityList);

                // Insert in chunks to avoid DB overload
                const chunkSize = 50;
                for (let i = 0; i < uniqueCities.length; i += chunkSize) {
                    const chunk = uniqueCities.slice(i, i + chunkSize);
                    await this.hotelCityRepositoryService.createCity(country.code, country.name, chunk);
                }

                console.log(`✅ Cities synced for ${country.code}`);
            } catch (err) {
                console.error(`❌ Error syncing cities for ${country.code}:`, err.message);
            }
        });

        // Run all countries in parallel, but handle errors individually
        await Promise.allSettled(allPromises);

        console.log('🏁 All city sync jobs completed.');
        return true;
    }

    async syncHotelTBOCodeData(chunkSize = 80) {
        const summary = { synced: 0, skipped: 0, failed: 0, failedCities: [] };

        try {
            const cities = await this.hotelCityRepositoryService.getAllCities();
            if (!cities?.length) {
                console.log('⚠️ No cities found in DB to sync hotel codes.');
                return summary;
            }

            console.log(`▶️ Starting hotel code sync for ${cities.length} cities.`);

            const fetchAndSaveCityHotels = async (city) => {
                if (!city.city_code) return;

                const existingHotels = await this.hotelTboCodeRepositoryService.countHotelsByCity?.(city.city_code);
                if (existingHotels > 0) {
                    console.log(`⏩ Skipping city ${city.city_name} (${city.city_code}) — already synced`);
                    summary.skipped++;
                    return;
                }

                const hotelCodeListUrl = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
                const maxRetries = 3;

                for (let attempt = 1; attempt <= maxRetries; attempt++) {
                    try {
                        const cityHotels = await this.hotelTBOAPIService.fetchCityHotelDetails(hotelCodeListUrl, city.city_code);

                        if (!cityHotels?.Hotels?.length) {
                            console.warn(`⚠️ No hotels found for city: ${city.city_name} (${city.city_code})`);
                            return;
                        }

                        await this.hotelTboCodeRepositoryService.saveOrUpdateHotelCodes(city, cityHotels.Hotels);
                        console.log(`✅ Saved ${cityHotels.Hotels.length} hotels for city: ${city.city_name}`);
                        summary.synced++;
                        return; // success, exit retry loop
                    } catch (err: any) {
                        const status = err.response?.status || 'NO_RESPONSE';
                        const message = err.response?.data?.message || err.message || 'Unknown error';

                        console.warn(`⚠️ Attempt ${attempt} failed for ${city.city_name} (${city.city_code}) - Status: ${status}, Message: ${message}`);

                        if (attempt < maxRetries) await new Promise((r) => setTimeout(r, attempt * 3000)); // exponential backoff
                        else {
                            console.error(`❌ Failed to sync city after ${maxRetries} attempts: ${city.city_name} (${city.city_code})`);
                            summary.failed++;
                            summary.failedCities.push(city.city_name);
                        }
                    }
                }
            };

            // Process cities in chunks
            for (let i = 0; i < cities.length; i += chunkSize) {
                const chunk = cities.slice(i, i + chunkSize);
                await Promise.all(chunk.map(fetchAndSaveCityHotels));
                console.log(`▶️ Completed chunk ${i / chunkSize + 1} / ${Math.ceil(cities.length / chunkSize)}`);
            }

            console.log(`✅ Hotel code sync completed. Synced: ${summary.synced}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`);
            if (summary.failedCities.length) {
                console.log(`❌ Failed cities: ${summary.failedCities.join(', ')}`);
            }

            return summary;
        } catch (error) {
            console.error('❌ Error syncing Hotel TBO codes:', error?.message || error);
            throw error;
        }
    }
}
