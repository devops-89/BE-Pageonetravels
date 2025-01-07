import { Injectable , Inject } from '@nestjs/common';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from 'cache-manager'

@Injectable()
export class RedisCacheService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ){}

    async setCache(key: string, token: string, ttl: number) {
    
      await this.cacheManager.set(key, `${token}`,  ttl); // ttl in seconds
  }

  async getCache(key: string) {
   
      const value = await this.cacheManager.get(`${key}`); // ttl in seconds
      return value
  }

  async deleteCache(key: string) {
      const value = await this.cacheManager.del(key);
      return value; 
  }
}