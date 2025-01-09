import { Injectable, Inject } from '@nestjs/common';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service';
import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
import { FLIGHTDATA } from '../../../../libs/config/config.interface';

@Injectable()
export class GenerateTokenService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly rediscacheservice: RedisCacheService,
    private readonly tboConfigService: TBO_CredentialsService,
  ) {}

  // Function to generate token for Hotel API
  async generateHotelToken(ip_address: string) {
    try {
      const tbo_credentials = await this.getHotelCredentials();
      const base_url = tbo_credentials.FLIGHT_AUTHENTICATION; 
      const payload = {
        ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
        UserName: tbo_credentials.FLIGHT_USERNAME,
        Password: tbo_credentials.FLIGHT_PASSWORD,
        EndUserIp: ip_address,
      };

      // Make the API call to get the token
      const result = await axios.post(base_url, payload);
      const token = result.data.TokenId;
      await this.rediscacheservice.setCache(`hotelToken:${ip_address}`, token, 82800); // Cache for 23 hours
      return token;
    } catch (error) {
      console.log("Error in hotel token generation", error);
      throw error;
    }
  }

  async getHotelCredentials() {
    try {
      const tbo_credentials = await this.tboConfigService.getTBOCredentials();
      return tbo_credentials as FLIGHTDATA;
    } catch (error) {
      console.log("Error fetching hotel credentials", error);
      throw error;
    }
  }

  async getToken(ip_address: string) {
    try {
       
        let token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);
        const tbo_credentials = await this.getHotelCredentials();
        if (!token) {
            await this.generateHotelToken(ip_address);

            token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);
        }
        
        const payload = {
            TBO_data: tbo_credentials,
            token: token as string,
        };

        return payload;

    } catch (error) {
        console.error("Failed in getToken API:", error);
        throw error;
    }
}
}

// import { Injectable, Inject } from '@nestjs/common';
// import axios from 'axios';
// import { CACHE_MANAGER } from '@nestjs/cache-manager';
// import { Cache } from 'cache-manager';
// import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
// import { FLIGHTDATA } from '../../../../libs/config/config.interface';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";

// @Injectable()
// export class GenerateTokenService {
//     private tbo_token: string;

//     constructor(
//         @Inject(CACHE_MANAGER) private cacheManager: Cache,
//         private readonly tboConfigService: TBO_CredentialsService,
//         private readonly redisCacheService: RedisCacheService,
//     ) {}

//     // Function to generate token for Hotel API
//     async generateHotelToken(ip_address: string) {
//         try {
//             const tbo_credentials = await this.getHotelCredentials();
//             const base_url = tbo_credentials.HOTEL_SEARCH; // URL for token generation
//             const payload = {
//                 ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//                 UserName: tbo_credentials.FLIGHT_USERNAME,
//                 Password: tbo_credentials.FLIGHT_PASSWORD,
//                 EndUserIp: ip_address,
//             };

//             // Make the API call to get the token
//             const result = await axios.post(base_url, payload);
//             // Save the generated token in cache for re-use
//             await this.redisCacheService.setCache(`hotelToken:${ip_address}`, result.data.TokenId, 82800);
//             return result.data.TokenId;
//         } catch (error) {
//             console.log("Error in hotel token generation", error);
//             throw error;
//         }
//     }

//     // Fetch credentials for the Hotel API
//     async getHotelCredentials() {
//         try {
//             const tbo_credentials = await this.tboConfigService.getTBOCredentials();
//             return tbo_credentials as FLIGHTDATA;
//         } catch (error) {
//             console.log("Error fetching hotel credentials", error);
//             throw error;
//         }
//     }

//     // Get the token from cache or generate a new one
//     async getHotelToken(ip_address: string) {
//         try {
//             // Check if token exists in cache
//             let token = await this.redisCacheService.getCache(`hotelToken:${ip_address}`);
//             if (!token) {
//                 // If no token is found, generate a new one
//                 token = await this.generateHotelToken(ip_address);
//             }
//             return token;
//         } catch (error) {
//             console.error("Failed to fetch hotel token:", error);
//             throw error;
//         }
//     }
// }


// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service'; // Assuming your RedisCacheService is located here

// @Injectable()
// export class GenerateTokenService {
//   private readonly apiUrl = 'http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate';
//   private readonly tokenTTL = 82800;  // Cache token for 23 hours (in seconds)

//   constructor(private readonly redisCacheService: RedisCacheService) {}

//   // Generate or fetch the token from cache
//   async generateToken(ip_address: string): Promise<string> {
//     try {
//       // Check if the token is already in Redis cache
//       const cachedToken = await this.redisCacheService.getCache(`tboToken:${ip_address}`);
//       if (cachedToken) {
//         console.log('Token fetched from Redis cache');
//         return;  // Return the cached token
//       }

//       // If token not found in cache, generate a new one
//       const payload = {
//         ClientId: 'ApiIntegrationNew',
//         UserName: 'Pageone',
//         Password: 'Pageone@1234',
//         EndUserIp: ip_address,
//       };

//       const response = await axios.post(this.apiUrl, payload);
//       const token = response.data.TokenId;

//       if (!token) {
//         throw new Error('TokenId not received');
//       }

//       // Cache the generated token in Redis for the next 23 hours
//       await this.redisCacheService.setCache(`tboToken:${ip_address}`, token, this.tokenTTL);
//       console.log('Token cached in Redis');
//       return token;

//     } catch (error) {
//       console.error('Authentication failed:', error);
//       throw new Error('Failed to authenticate and get token');
//     }
//   }
// }

// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { RedisCacheService } from '../../../../libs/redis-cache-service/redis-cache-service'; // Assuming your RedisCacheService is located here

// @Injectable()
// export class GenerateTokenService {
//   private readonly apiUrl = 'http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate';
//   private readonly tokenTTL = 82800;  // Cache token for 23 hours (in seconds)

//   constructor(private readonly redisCacheService: RedisCacheService) {}

//   // Generate or fetch the token from cache
//   async generateToken(ip_address: string): Promise<string> {
//     try {
//       // Check if the token is already in Redis cache
//       const cachedToken = await this.redisCacheService.getCache(`tboToken:${ip_address}`);
//       if (cachedToken) {
//         console.log('Token fetched from Redis cache');
//         return ;
//       }

//       // If token not found in cache, generate a new one
//       const payload = {
//         ClientId: 'ApiIntegrationNew',
//         UserName: 'Pageone',
//         Password: 'Pageone@1234',
//         EndUserIp: ip_address,
//       };

//       const response = await axios.post(this.apiUrl, payload);
//       const token = response.data.TokenId;

//       if (!token) {
//         throw new Error('TokenId not received');
//       }

//       // Cache the generated token in Redis for the next 23 hours
//       await this.redisCacheService.setCache(`tboToken:${ip_address}`, token, this.tokenTTL);
//       console.log('Token cached in Redis');
//       return token;

//     } catch (error) {
//       console.error('Authentication failed:', error);
//       throw new Error('Failed to authenticate and get token');
//     }
//   }
// }


// import { Injectable } from '@nestjs/common';
// import axios from 'axios';


// @Injectable()
// export class GenerateTokenService {
    
//   private readonly apiUrl = 'http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate';

//   async generateToken(ip_address: string): Promise<string> {
//     const payload = {
//       ClientId: 'ApiIntegrationNew', 
//       UserName: 'Pageone',           
//       Password: 'Pageone@1234',      
//       EndUserIp: ip_address,         
//     };

//     try {
//       const response = await axios.post(this.apiUrl, payload);

//       if (response && response.data && response.data.TokenId) {
//         return response.data.TokenId;
//       } else {
//         throw new Error('TokenId not received');
//       }
//     } catch (error) {
//       console.error('Authentication failed:', error);
//       throw new Error('Failed to authenticate and get token');
//     }
//   }


// import { Injectable, Inject } from '@nestjs/common';
// import axios from 'axios';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";
// import { Cache } from 'cache-manager';
// import { CACHE_MANAGER } from "@nestjs/cache-manager";

// @Injectable()
// export class GenerateTokenService {
//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private readonly rediscacheservice: RedisCacheService
//   ) {}

//   /**
//    * Generate a TBO token and store it in the Redis cache.
//    * @param ip_address The user's IP address.
//    */
//   async generateTBOToken(ip_address: string): Promise<string> {
//     try {
//       const base_url = process.env.HOTEL_AUTHENTICATION;  // Get from .env
//       const payload = {
//         ClientId: process.env.FLIGHT_CLIENT_ID,  // Use environment variable
//         UserName: process.env.FLIGHT_USERNAME,  // Use environment variable
//         Password: process.env.FLIGHT_PASSWORD,  // Use environment variable
//         EndUserIp: ip_address,
//       };

//       const result = await axios.post(base_url, payload);

//       // Store the generated token in Redis with a TTL of 82800 seconds (23 hours).
//       await this.rediscacheservice.setCache(`tboToken:${ip_address}`, result.data.TokenId, 82800);

//       return result.data.TokenId;
//     } catch (error) {
//       console.log("Error in generateTBOToken:", error);
//       throw new Error("Error generating TBO token: " + error.message);
//     }
//   }

//   /**
//    * Fetch the token for a given IP address, either from cache or by generating it.
//    * @param ip_address The user's IP address.
//    */
//   async getToken(ip_address: string) {
//     try {
//       // Check if the token is already in the cache.
//       let token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);

//       // If the token is not found, generate a new one.
//       if (!token) {
//         token = await this.generateTBOToken(ip_address);
//       }

//       return token;
//     } catch (error) {
//       console.error("Failed in getToken API:", error);
//       throw new Error('Error fetching token: ' + error.message);
//     }
//   }

//   /**
//    * Set a token into the cache.
//    * @param ip_address The user's IP address.
//    * @param token The generated token.
//    */
//   async setCache(ip_address: string, token: string) {
//     const ip_key = `tboToken:${ip_address}`;
//     await this.cacheManager.set(ip_key, token);  // TTL of 23 hours
//   }

//   /**
//    * Get a token from the cache.
//    * @param ip_address The user's IP address.
//    */
//   async getCache(ip_address: string) {
//     const ip_key = `tboToken:${ip_address}`;
//     const value = await this.cacheManager.get(ip_key);
//     return value;
//   }
// }

// import { Injectable, Inject } from '@nestjs/common';
// import axios from 'axios';
// import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
// import { Cache } from 'cache-manager';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";
// import { CACHE_MANAGER } from "@nestjs/cache-manager";

// @Injectable()
// export class GenerateTokenService {
//   private tbo_token: string;

//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private readonly tboConfigService: TBO_CredentialsService,
//     private readonly rediscacheservice: RedisCacheService
//   ) {}

//   /**
//    * Generate a TBO token and store it in the Redis cache.
//    * @param ip_address The user's IP address.
//    */
//   async generateTBOToken(ip_address: string): Promise<string> {
//     try {
//       const tbo_credentials = await this.getHotelTBOCredentials();
//       const base_url = tbo_credentials.HOTEL_AUTHENTICATION;

//       const payload = {
//         ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//         UserName: tbo_credentials.FLIGHT_USERNAME,
//         Password: tbo_credentials.FLIGHT_PASSWORD,
//         EndUserIp: ip_address,
//       };

//       const result = await axios.post(base_url, payload);

//       // Store the generated token in cache with a TTL of 82800 seconds (23 hours).
//       await this.rediscacheservice.setCache(`tboToken:${ip_address}`, result.data.TokenId, 82800);

//       // Return the token directly
//       return result.data.TokenId;
//     } catch (error) {
//       console.log("Error in generateTBOToken:", error);
//       throw error;
//     }
//   }

//   /**
//    * Get the TBO credentials from the config service.
//    */
//   async getHotelTBOCredentials() {
//     return {
//       HOTEL_AUTHENTICATION: 'http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate',
//       FLIGHT_CLIENT_ID: 'your-client-id',
//       FLIGHT_USERNAME: 'your-username',
//       FLIGHT_PASSWORD: 'your-password',
//     };
//   }

//   /**
//    * Fetch the token for a given IP address, either from cache or by generating it.
//    * @param ip_address The user's IP address.
//    */
//   async getToken(ip_address: string) {
//     try {
//       // Check if the token is already in the cache.
//       let token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);
//       const tbo_credentials = await this.getHotelTBOCredentials();

//       // If the token is not found in the cache, generate a new one.
//       if (!token) {
//         token = await this.generateTBOToken(ip_address);
//       }

//       // Return the credentials and token in the payload.
//       return {
//         TBO_data: tbo_credentials,
//         token: token,
//       };
//     } catch (error) {
//       console.error("Failed in getToken API:", error);
//       throw error;
//     }
//   }

//   /**
//    * Set a token into the cache.
//    * @param ip_address The user's IP address.
//    * @param token The generated token.
//    */
//   async setCache(ip_address: string, token: string) {
//     const ip_key = `tboToken:${ip_address}`;
//     await this.cacheManager.set(ip_key, token);  // ttl in seconds
//   }

//   /**
//    * Get a token from the cache.
//    * @param ip_address The user's IP address.
//    */
//   async getCache(ip_address: string) {
//     const ip_key = `tboToken:${ip_address}`;
//     const value = await this.cacheManager.get(ip_key);
//     return value;
//   }
// }

// import { Injectable, Inject } from '@nestjs/common';
// import axios from 'axios';
// import { TBO_CredentialsService } from '../../../../libs/loadtbo-db-config/tbo-config.service';
// import { Cache } from 'cache-manager';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";
// import { CACHE_MANAGER } from "@nestjs/cache-manager";
// @Injectable()
// export class GenerateTokenService {
//     private tbo_token: string;

//     constructor(
//         @Inject(CACHE_MANAGER) private cacheManager: Cache,
//         private readonly tboConfigService: TBO_CredentialsService,
//         private readonly rediscacheservice: RedisCacheService
//     ) {}

//     async generateTBOToken(ip_address: string) {
//         try {
//             const tbo_credentials = await this.getHotelTBOCredentials();
//             const base_url = tbo_credentials.HOTEL_AUTHENTICATION;

//             const payload = {
//                 ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//                 UserName: tbo_credentials.FLIGHT_USERNAME,
//                 Password: tbo_credentials.FLIGHT_PASSWORD,
//                 EndUserIp: ip_address,
//             };

//             const result = await axios.post(base_url, payload);
//             await this.rediscacheservice.setCache(`tboToken:${ip_address}`, result.data.TokenId, 82800);
//             return this.tbo_token;

//         } catch (error) {
//             console.log("Error in the generate token", error);
//             throw error;
//         }
//     }

//     async getHotelTBOCredentials() {
//         return {
//             HOTEL_AUTHENTICATION: 'https://http://api.tektravels.com/SharedServices/SharedData.svc/rest/Authenticate/authenticate',
//             FLIGHT_CLIENT_ID: 'your-client-id',
//             FLIGHT_USERNAME: 'your-username',
//             FLIGHT_PASSWORD: 'your-password',
//         };
//     }

//     async getToken(ip_address: string) {
//         try {
//             let token = await this.getCache(ip_address);
//             const tbo_credentials = await this.getHotelTBOCredentials();
//             if (!token) {
//                 await this.generateTBOToken(ip_address);
//                 token = await this.getCache(ip_address);
//             }

//             const payload = {
//                 TBO_data: tbo_credentials,
//                 token: token as string,
//             };

//             return payload;

//         } catch (error) {
//             console.error("Failed in getToken API:", error);
//             throw error;
//         }
//     }

//     async setCache(ip_address: string, token: string) {
//         const ip_key = `tboToken:${ip_address}`;
//         await this.cacheManager.set(ip_key, token);  // ttl in seconds
//     }

//     async getCache(ip_address: string) {
//         const ip_key = `tboToken:${ip_address}`;
//         const value = await this.cacheManager.get(ip_key);
//         return value;
//     }
// }


// import {  Injectable } from "@nestjs/common";
// import axios from 'axios';
// import { TBO_CredentialsService } from "libs/loadtbo-db-config/tbo-config.service";


// @Injectable()
// export class GenerateTokenService {
//     private tbo_token: string;

//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//         private readonly tboConfigService: TBO_CredentialsService,
//         private readonly rediscacheservice: RedisCacheService,
       

//     constructor(
       
//     ) {}


//     async generateTBOToken(ip_address:string) {
//         try {
           
//             const tbo_credentials = await this.getHotelTBOCredentials();
//             const base_url = tbo_credentials.HOTEL_AUTHENTICATION;

//             const payload = {
//                 ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//                 UserName: tbo_credentials.FLIGHT_USERNAME,
//                 Password: tbo_credentials.FLIGHT_PASSWORD,
//                 // EndUserIp: this.tbo_credentials.FLIGHT_ENDUSERIP,
//                 EndUserIp: ip_address,
//             }

//             const result = await axios.post(base_url, payload)
//             await this.rediscacheservice.setCache(`tboToken:${ip_address}`,result.data.TokenId, 82800);
//             return this.tbo_token;
           
//         } catch (error) {
//             console.log("Error in the generate token", error);
//             throw error
//         }
//     }

//     async getHotelTBOCredentials() {
//         return {
//           HOTEL_AUTHENTICATION: 'https://your-tbo-api-url.com/authenticate',
//           FLIGHT_CLIENT_ID: 'your-client-id',
//           FLIGHT_USERNAME: 'your-username',
//           FLIGHT_PASSWORD: 'your-password',
//         };
//       }
    
//     // Get token (used for hotel searches)
//     async getToken(ip_address: string) {
//         try {
//             let token = await this.getCache(ip_address);
//             const tbo_credentials = await this.getHotelTBOCredentials();
//             if (!token) {
//                 await this.generateTBOToken(ip_address);
//                 token = await this.getCache(ip_address);
//             }

//             const payload = {
//                 TBO_data: tbo_credentials,
//                 token: token as string,
//             };

//             return payload;

//         } catch (error) {
//             console.error("Failed in getToken API:", error);
//             throw error;
//         }
//     }

//     // Cache management
//     async setCache(ip_address: string, token: string) {
//         const ip_key = `tboToken:${ip_address}`;
//         await this.cacheManager.set(ip_key, `${token}`, 82800); // ttl in seconds
//     }

//     async getCache(ip_address: string) {
//         const ip_key = `tboToken:${ip_address}`;
//         const value = await this.cacheManager.get(ip_key);
//         return value;
//     }
// }


// import { Injectable, Inject } from "@nestjs/common";
// import axios from 'axios';
// import { CACHE_MANAGER } from "@nestjs/cache-manager";
// import { Cache } from 'cache-manager';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";
// import { TBO_CredentialsService } from "../../../../libs/loadtbo-db-config/tbo-config.service";

// @Injectable()
// export class GenerateTokenService {

//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private readonly tboConfigService: TBO_CredentialsService,
//     private readonly rediscacheservice: RedisCacheService
//   ) {}

//   async generateTBOToken(ip_address: string) {
//     try {
//       const tbo_credentials = await this.getTBOCredentials();
//       const base_url = tbo_credentials.HOTEL_AUTHENTICATION;

//       const payload = {
//         ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//         UserName: tbo_credentials.FLIGHT_USERNAME,
//         Password: tbo_credentials.FLIGHT_PASSWORD,
//         EndUserIp: ip_address,
//       };

//       const result = await axios.post(base_url, payload);
//       const token = result.data.TokenId;
//       await this.rediscacheservice.setCache(`tboToken:${ip_address}`, token, 82800); // Cache for 23 hours
//       return token;
//     } catch (error) {
//       console.error("Error generating TBO token", error);
//       throw new Error('Failed to generate TBO token');
//     }
//   }

//   async getTBOCredentials() {
//     try {
//       const tbo_credentials = await this.tboConfigService.getTBOCredentials();
//       return tbo_credentials;
//     } catch (error) {
//       console.error("Error in getTBOCredentials", error);
//       throw new Error('Failed to get TBO credentials');
//     }
//   }

//   async getToken(ip_address: string) {
//     let token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);
//     if (!token) {
//       token = await this.generateTBOToken(ip_address);
//     }
//     return token;
//   }
// }


// import { Injectable, Inject } from "@nestjs/common";
// import axios from 'axios';
// import { CACHE_MANAGER } from "@nestjs/cache-manager";
// import { Cache } from 'cache-manager';
// import { RedisCacheService } from "../../../../libs/redis-cache-service/redis-cache-service";
// import { TBO_CredentialsService } from "../../../../libs/loadtbo-db-config/tbo-config.service";

// @Injectable()
// export class GenerateTokenService {

//   constructor(
//     @Inject(CACHE_MANAGER) private cacheManager: Cache,
//     private readonly tboConfigService: TBO_CredentialsService,
//     private readonly rediscacheservice: RedisCacheService
//   ) {}

//   async generateTBOToken(ip_address: string) {
//     try {
//       const tbo_credentials = await this.getTBOCredentials();
//       const base_url = tbo_credentials.FLIGHT_AUTHENTICATION;

//       const payload = {
//         ClientId: tbo_credentials.FLIGHT_CLIENT_ID,
//         UserName: tbo_credentials.FLIGHT_USERNAME,
//         Password: tbo_credentials.FLIGHT_PASSWORD,
//         EndUserIp: ip_address,
//       };

//       const result = await axios.post(base_url, payload);
//       const token = result.data.TokenId;
//       await this.rediscacheservice.setCache(`tboToken:${ip_address}`, token, 82800); // Cache for 23 hours
//       return token;
//     } catch (error) {
//       console.error("Error generating TBO token", error);
//       throw new Error('Failed to generate TBO token');
//     }
//   }

//   async getTBOCredentials() {
//     try {
//       const tbo_credentials = await this.tboConfigService.getTBOCredentials();
//       return tbo_credentials;
//     } catch (error) {
//       console.error("Error in getTBOCredentials", error);
//       throw new Error('Failed to get TBO credentials');
//     }
//   }

//   async getToken(ip_address: string) {
//     let token = await this.rediscacheservice.getCache(`tboToken:${ip_address}`);
//     if (!token) {
//       token = await this.generateTBOToken(ip_address);
//     }
//     return token;
//   }
// }

