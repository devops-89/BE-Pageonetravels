import { Inject, Injectable } from '@nestjs/common';
import { GenerateTokenService } from './generateToken.service';
import { HotelTBOAPIService } from '../../../../libs/http-api-service/hoteltbo-api-service';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { HotelCity, HotelCode } from '../../../../libs/database/src';
import { HotelTboCodeRepositoryService } from '../../../../libs/database/src';
import { HotelCodeRepositoryService } from '../../../../libs/database/src';
import { HotelCountryRepositoryService } from '../../../../libs/database/src';
import { CommissionRepositoryService } from '../../../../libs/database/src';
import { HotelDetailsRepositoryService } from '../../../../libs/database/src';
import { HotelCityRepositoryService } from '../../../../libs/database/src';
import { OrderRepositoryService } from '../../../../libs/database/src';
import { COMMISSION_TYPE } from '../../../../libs/constants/autenticationConstants/userContants';
import { ERROR_CODES } from '../../../../libs/constants/commonConstants';
import { HotelDetailDto, GetBookingDetailDto } from '../../../../libs/dtos/hotel/search-hotel.dto';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import axios from 'axios';
import { ORDER_STATUS } from '../../../../libs/constants/bookingContant';
import { FLIGHTDATA } from '../../../../libs/config/config.interface';

// type SearchResult = {
//     name: string;
//     code: string;
//     type: 'city' | 'hotel';
// };

// Custom chunk function (replaces lodash.chunk)
function chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

// Custom concurrency limiter (replaces p-limit)
function createLimiter(limit: number) {
    let active = 0;
    const queue: (() => void)[] = [];

    const runNext = () => {
        if (active >= limit || queue.length === 0) return;
        active++;
        const fn = queue.shift();
        fn();
    };

    return async <T>(fn: () => Promise<T>): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    active--;
                    runNext();
                }
            });
            runNext();
        });
    };
}

type CityResult = {
    cityName: string;
    cityCode: string;
    countryName: string;
    type: 'city';
};

type HotelResult = {
    hotelName: string;
    hotelCode: string;
    cityCode: number;
    countryName: string;
    type: 'hotel';
};

export type SearchResult = (CityResult | HotelResult)[];

@Injectable()
export class SearchHotelService {
    constructor(
        private readonly tboConfigService: TBO_CredentialsService,
        private readonly hotelTBOAPIService: HotelTBOAPIService,
        private readonly commissionRepositoryService: CommissionRepositoryService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly orderRepository: OrderRepositoryService,
        private readonly hotelCountryRepositoryService: HotelCountryRepositoryService,
        private readonly hotelDetailsRepositoryService: HotelDetailsRepositoryService,
        private readonly hotelCityRepositoryService: HotelCityRepositoryService,
        private readonly generateTokenService: GenerateTokenService,
        private readonly hotelTboCodeRepositoryService: HotelTboCodeRepositoryService,
        private readonly hotelCodeRepositoryService: HotelCodeRepositoryService,
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

    // search the cities codes by city, country name
    async getSearchCodesByCityAndHotel(query: string): Promise<SearchResult> {
        // return this.hotelCityRepositoryService.searchCities(query);
        //     getting the top 50 city results
        const cityResults: Partial<HotelCity>[] = await this.hotelCityRepositoryService.searchCities(query);
        //     getting top 50 hotel results
        const hotelResults: Partial<HotelCode>[] = await this.hotelCodeRepositoryService.searchHotels(query);

        //     Map cities => unified or same keys to return
        const cities = cityResults.map((city) => ({
            cityName: city.city_name,
            cityCode: city.city_code,
            countryName: city.country_name,
            type: 'city' as const,
        }));

        //     Map hotels => unified or same keys to return
        const hotels = hotelResults.map((hotel) => ({
            hotelName: hotel.hotelName,
            hotelCode: hotel.hotelCode,
            cityCode: hotel.cityCode,
            countryName: hotel.countryName,
            type: 'hotel' as const,
        }));

        // Balanced merging → 50 cities + 50 hotels
        return [...cities, ...hotels];
    }

    async searchCity() {
        try {
            const city_list_from_cache = (await this.rediscacheservice.getCache('CityList')) as string;

            if (city_list_from_cache) {
                return { message: 'Country list sent successfully', data: JSON.parse(city_list_from_cache) };
            }

            const countryCodes = await this.hotelCountryRepositoryService.getCountryCode();

            // const city_search_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/CityList';

            const city_list = await this.hotelTBOAPIService.fetchCityList(countryCodes);

            if (city_list && city_list.length) {
                await this.rediscacheservice.setCache('CityList', JSON.stringify(city_list), 88000);
            }

            return { message: 'Country list fetched successfully', data: city_list };
        } catch (error) {
            console.error('Error in searchCountry:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the country list.');
        }
    }

    // hotel details api fetching from the hotel Detail Database
    // async ClientHotelDetails(body: { hotelCode: string }) {
    //     if (!body.hotelCode) {
    //         const error = new Error('hotelCode is required.');
    //         (error as any).statusCode = ERROR_CODES.BAD_REQUEST;
    //         throw error;
    //     }
    //
    //     try {
    //         const hotel_details = await this.hotelDetailsRepositoryService.getHotelDetailByCode(body.hotelCode);
    //
    //         if (!hotel_details) {
    //             const error = new Error(`No details found for hotelCode: ${body.hotelCode}`);
    //             (error as any).statusCode = ERROR_CODES.NOT_FOUND;
    //             throw error;
    //         }
    //
    //         const CountryCode:string = hotel_details.countryCode;
    //         const commissionType = await this.commissionRepositoryService.getCommissionbytype(CountryCode === 'IN' ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL);
    //
    //         const response = {
    //             ...hotel_details,
    //             COMMISSION: commissionType
    //         };
    //
    //
    //
    //         return { message: 'Hotel Details fetched successfully', data: response };
    //     } catch (error: any) {
    //         console.error('Error in ClientHotelDetails:', error.message || error);
    //
    //         // Preserve the statusCode if already set, otherwise fallback to UNEXPECTED_ERROR
    //         const statusCode = error.statusCode || ERROR_CODES.UNEXPECTED_ERROR;
    //         const err = new Error(error.message || 'Failed to fetch the hotel details.');
    //         (err as any).statusCode = statusCode;
    //
    //         throw err;
    //     }
    // }

    // client Hotel Details from the api calling
    async ClientHotelDetails(body: HotelDetailDto) {
        try {
            const hotel_details = await this.hotelTBOAPIService.fetchClientHotelDetails(body);
            if (!hotel_details) {
                const error = new Error(`No details found for hotelCode`);
                (error as any).statusCode = ERROR_CODES.NOT_FOUND;
                throw error;
            }

            const CountryCode: string = hotel_details.countryCode;
            const commissionType = await this.commissionRepositoryService.getCommissionbytype(CountryCode === 'IN' ? COMMISSION_TYPE.HOTEL_DOMESTIC : COMMISSION_TYPE.HOTEL_INTERNATIONAL);
            const response = {
                ...hotel_details,
                COMMISSION: commissionType,
            };

            return { message: 'Hotel Details fetched successfully', data: response };
        } catch (error) {
            console.error('Error in HotelDetails:', error.message || error);
            throw new Error(error.message || 'Failed to fetch the hotel details.');
        }
    }

    // hotel details api to be used in the preebook api
    // async HotelDetails() {
    //     try {
    //         // const { hotel_city_code } = body;
    //
    //         const hotelcodelist_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/hotelcodelist';
    //         const code_list = await this.hotelTBOAPIService.fetchHotelCityCodeList(hotelcodelist_base_url);
    //         console.log('>>>>>>', code_list);
    //
    //         const hotelDetailsList = [];
    //         for (const city of code_list.HotelCodes) {
    //             const hotel_details_base_url = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/Hoteldetails';
    //             const hotel_details = await this.hotelTBOAPIService.fetchHotelDetails(hotel_details_base_url, city);
    //             console.log('>>>>>>>>>>> >>>> >', hotel_details);
    //             hotelDetailsList.push(hotel_details);
    //         }
    //
    //         return { message: 'Hotel Details fetched successfully', data: hotelDetailsList };
    //     } catch (error) {
    //         console.error('Error in HotelDetails:', error.message || error);
    //         throw new Error(error.message || 'Failed to fetch the hotel details.');
    //     }
    // }

    // async CityHotelDetails(body) {
    //     try {
    //         const { city_code } = body;
    //
    //         const city_hotel_details = 'http://api.tbotechnology.in/TBOHolidays_HotelAPI/TBOHotelCodeList';
    //
    //         const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(city_hotel_details, city_code);
    //
    //         return { message: 'Hotel Details fetched successfully', data: hotel_details };
    //     } catch (error) {
    //         console.error('Error in CityHotelDetails:', error.message || error);
    //         throw new Error(error.message || 'Failed to fetch the city hotel details.');
    //     }
    // }

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

            const tbo_credentials: Promise<FLIGHTDATA> = this.tboConfigService.getTBOCredentials();
            const hotelTboCodeListApi: string = (await tbo_credentials).HOTEL_TBO_CODE_LIST;
            console.log('+++++++++++tbo_code_list+++++++++++', hotelTboCodeListApi);
            console.log('++++++++++++++++++++++++++++body payload:', body);

            // Get hotel list for the city
            const hotel_details = await this.hotelTBOAPIService.fetchCityHotelDetails(hotelTboCodeListApi, body.CityCodes);
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
            const data = body.BookingCode;
            const response = await this.hotelTBOAPIService.handlePreBook(data);
            return { message: 'Hotel Pre Book fetched successfully', data: response };
        } catch (error) {
            console.log('Error in PreBook', error);
            throw error;
        }
    }

    async bookingDetails(orderId: string, ip: string) {
        try {
            // const url = 'https://hotelbe.tektravels.com/hotelservice.svc/rest/Getbookingdetail';

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

                const bookingDetails = await this.hotelTBOAPIService.hotelBookingDetails(payload);
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

            const tbo_credentials: Promise<FLIGHTDATA> = this.tboConfigService.getTBOCredentials();
            const baseURL: string = (await tbo_credentials).HOTEL_SEARCH;

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

        // const url = 'https://HotelBE.tektravels.com/hotelservice.svc/rest/GetChangeRequestStatus';

        // 4. Call hotel cancellation API
        const response = await this.hotelTBOAPIService.getChangeRequestStatus(payload);
        // const response = await axios.post(url, payload);
        const result = response?.HotelChangeRequestStatusResult;

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

    // all syncing services
    async syncCountryData() {
        const country_list = await this.hotelTBOAPIService.fetchCountryList();
        if (country_list.Status.Code === 200) {
            await this.hotelCountryRepositoryService.createCountry(country_list.CountryList);
        }
        return country_list;
    }

    async syncCityData() {
        const countryCodes = await this.hotelCountryRepositoryService.getCountryCode();

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
                const citiesResponse = await this.hotelTBOAPIService.fetchCityList([country]);
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

        // 1️⃣ Clear existing hotel details before syncing
        await this.hotelTboCodeRepositoryService.clearAll();
        console.log('🗑️ Cleared all existing hotel tbo code');

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

                try {
                    const tbo_credentials: Promise<FLIGHTDATA> = this.tboConfigService.getTBOCredentials();
                    const hotelTboCodeListApi: string = (await tbo_credentials).HOTEL_TBO_CODE_LIST;

                    const cityHotels = await this.hotelTBOAPIService.fetchCityHotelDetails(hotelTboCodeListApi, city.city_code);

                    if (!cityHotels?.Hotels?.length) {
                        console.warn(`⚠️ No hotels found for city: ${city.city_name} (${city.city_code})`);
                        summary.skipped++;
                        return;
                    }

                    await this.hotelTboCodeRepositoryService.saveOrUpdateHotelCodes(city, cityHotels.Hotels);
                    console.log(`✅ Saved ${cityHotels.Hotels.length} hotels for city: ${city.city_name}`);
                    summary.synced++;
                } catch (err: any) {
                    const status = err.response?.status || 'NO_RESPONSE';
                    const message = err.response?.data?.message || err.message || 'Unknown error';

                    console.error(`❌ Failed to sync city: ${city.city_name} (${city.city_code}) - Status: ${status}, Message: ${message}`);
                    summary.failed++;
                    summary.failedCities.push(city.city_name);
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

    // sync hotel code table for all hotel city table city code
    async syncHotelCodeData(chunkSize = 80) {
        const summary = { synced: 0, skipped: 0, failed: 0, failedCities: [] };

        // 1️⃣ Clear existing hotel codes before syncing
        await this.hotelCodeRepositoryService.clearAll();
        console.log('🗑️ Cleared all existing hotel codes.');

        try {
            const cities = await this.hotelCityRepositoryService.getAllCities();
            if (!cities?.length) {
                console.log('⚠️ No cities found in DB to sync hotel codes.');
                return summary;
            }

            console.log(`▶️ Starting hotel code sync for ${cities.length} cities.`);

            const limit = createLimiter(10); // limit concurrency to 10 cities at a time

            const fetchAndSaveCityHotels = async (city) => {
                if (!city.city_code) return;

                const existingHotels = await this.hotelCodeRepositoryService.countByCity?.(city.city_code);
                if (existingHotels > 0) {
                    console.log(`⏩ Skipping city ${city.city_name} (${city.city_code}) — already synced`);
                    summary.skipped++;
                    return;
                }

                try {
                    const tbo_credentials: Promise<FLIGHTDATA> = this.tboConfigService.getTBOCredentials();
                    const hotelTboCodeListApi: string = (await tbo_credentials).HOTEL_TBO_CODE_LIST;

                    const cityHotels = await this.hotelTBOAPIService.fetchCityHotelDetails(hotelTboCodeListApi, city.city_code);

                    if (!cityHotels?.Hotels?.length) {
                        console.warn(`⚠️ No hotels found for city: ${city.city_name} (${city.city_code})`);
                        summary.skipped++;
                        return;
                    }

                    await this.hotelCodeRepositoryService.saveAllOneByOne(city, cityHotels.Hotels);
                    console.log(`✅ Saved ${cityHotels.Hotels.length} hotels for city: ${city.city_name}`);
                    summary.synced++;
                } catch (err: any) {
                    const tboCode = err?.Status?.Code;
                    const tboDesc = err?.Status?.Description;

                    if (tboCode === 500 && tboDesc === 'No Hotels Found') {
                        console.log(`⚠️ No inventory for city: ${city.city_name} (${city.city_code}) — skipping.`);
                        summary.skipped++;
                        return;
                    }

                    const status = err?.response?.status || 'NO_STATUS';
                    const msg = err?.response?.data?.message || err?.message || tboDesc || 'Unknown error';

                    console.error(`❌ Failed to sync city: ${city.city_name} (${city.city_code}) - Status: ${status}, Message: ${msg}`);
                    summary.failed++;
                    summary.failedCities.push(city.city_name);
                }
            };

            // 2️⃣ Process cities in chunks of `chunkSize`
            for (let i = 0; i < cities.length; i += chunkSize) {
                const chunk = cities.slice(i, i + chunkSize);

                // Run with concurrency limit
                await Promise.all(chunk.map((city) => limit(() => fetchAndSaveCityHotels(city))));

                console.log(`▶️ Completed chunk ${i / chunkSize + 1} / ${Math.ceil(cities.length / chunkSize)}`);
            }

            console.log(`✅ Hotel code sync completed. Synced: ${summary.synced}, Skipped: ${summary.skipped}, Failed: ${summary.failed}`);
            if (summary.failedCities.length) {
                console.log(`❌ Failed cities: ${summary.failedCities.join(', ')}`);
            }

            return summary;
        } catch (error) {
            console.error('Error syncing Hotel codes:', error?.message || error);
            throw error;
        }
    }

    // sync hotel code table for perticular city code
    async syncSingleCityHotelCode(cityCode: string) {
        if (!cityCode) {
            throw new Error('City code is required');
        }

        const city = await this.hotelCityRepositoryService.getCityByCode(cityCode);

        if (!city) {
            throw new Error(`City not found: ${cityCode}`);
        }

        try {
            // STEP 1: check existing hotel codes for city
            const existingHotels = await this.hotelCodeRepositoryService.countByCity(Number(cityCode));

            if (existingHotels > 0) {
                console.log(`🔄 Existing ${existingHotels} hotel codes found for city ${city.city_name}. Deleting...`);
                await this.hotelCodeRepositoryService.deleteByCityCode(Number(cityCode));
                console.log(`🗑️ Deleted existing hotel codes for city ${city.city_name}`);
            }

            // STEP 2: Fetch new API data
            const tbo_credentials: FLIGHTDATA = await this.tboConfigService.getTBOCredentials();
            const apiUrl = tbo_credentials.HOTEL_TBO_CODE_LIST;

            const cityHotels = await this.hotelTBOAPIService.fetchCityHotelDetails(apiUrl, cityCode);

            if (!cityHotels?.Hotels?.length) {
                return {
                    message: `No hotels found for ${city.city_name} (${cityCode})`,
                    status: 'empty',
                };
            }

            // STEP 3: Save fresh hotel codes
            await this.hotelCodeRepositoryService.saveAllOneByOne(city, cityHotels.Hotels);

            return {
                message: `Synced ${cityHotels.Hotels.length} hotels for city: ${city.city_name}`,
                status: 'success',
                total: cityHotels.Hotels.length,
            };
        } catch (err: any) {
            console.error('Single city sync failed:', err.message);
            throw new Error(`Sync failed for city ${cityCode}`);
        }
    }

    // sync hotelDetail table by calling the syncHotelDetail method for all city codes in hotelCityCode table
    async syncAutoHotelDetail() {
        const summary = { synced: 0, failed: 0, failedHotels: [] };

        try {
            // 1️⃣ Clear existing hotel details before syncing
            await this.hotelDetailsRepositoryService.clearAll();
            console.log('🗑️ Cleared all existing hotel details.');

            // 2️⃣ Fetch city codes + hotel codes
            const cityHotelCodes = await this.hotelTboCodeRepositoryService.getAllCityHotelCodes();
            if (!cityHotelCodes?.length) {
                console.log('⚠️ No hotel codes found in hotelTboCode table.');
                return summary;
            }

            console.log(`▶️ Starting auto hotel detail sync for ${cityHotelCodes.length} cities.`);

            // 3️⃣ Chunk city codes into groups of 100
            const cityChunks = chunkArray(cityHotelCodes, 100);

            // Limit concurrency (e.g. 5 parallel city batches at a time)
            const limit = createLimiter(5);

            for (const cityBatch of cityChunks) {
                await Promise.all(
                    cityBatch.map((cityRow) =>
                        limit(async () => {
                            const { city_code, hotel_codes } = cityRow;
                            if (!city_code || !hotel_codes) return;

                            console.log(`🏙️ Processing city ${city_code}`);

                            try {
                                // Split hotel codes into chunks of 20
                                const hotelCodeArray = hotel_codes.split(',');
                                const hotelCodeChunks = chunkArray(hotelCodeArray, 20);

                                for (const hotelChunk of hotelCodeChunks) {
                                    const body: HotelDetailDto = {
                                        Hotelcodes: hotelChunk.join(','), // 20 codes max
                                        Language: 'EN',
                                    };

                                    const hotelDetailApiResponse = await this.hotelTBOAPIService.fetchClientHotelDetails(body);

                                    await this.hotelDetailsRepositoryService.saveHotelDetailsList(hotelDetailApiResponse);
                                }

                                console.log(`✅ Synced hotel details for City ${city_code}`);
                                summary.synced++;
                            } catch (err: any) {
                                const msg = err?.response?.data?.message || err?.message || 'Unknown error';

                                console.error(`❌ Failed to sync hotels for City ${city_code} - ${msg}`);
                                summary.failed++;
                                summary.failedHotels.push(city_code);
                            }

                            console.log(`🏁 Completed city ${city_code}`);
                        })
                    )
                );
            }

            console.log(`✅ Auto hotel detail sync completed. Synced: ${summary.synced}, Failed: ${summary.failed}`);
            if (summary.failedHotels.length) {
                console.log(`❌ Failed cities: ${summary.failedHotels.join(', ')}`);
            }

            return summary;
        } catch (error) {
            console.error('Error in Auto Hotel Detail Sync:', error?.message || error);
            throw error;
        }
    }

    async syncHotelDetailData(body: HotelDetailDto) {
        try {
            const hotelDetailApiResponse = await this.hotelTBOAPIService.fetchClientHotelDetails(body);

            await this.hotelDetailsRepositoryService.saveHotelDetailsList(hotelDetailApiResponse);

            return hotelDetailApiResponse;
        } catch (error) {
            console.error('Error syncing Hotel Details:', error?.message || error);
            throw error;
        }
    }
}
