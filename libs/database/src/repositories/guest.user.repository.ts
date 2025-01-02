import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestUser } from '../entities/guestUser.enity';

@Injectable()
export class GuestUserRepositoryService {
    constructor(
        @InjectRepository(GuestUser)
        private readonly guestUserRepository: Repository<GuestUser>
    ) {}

    private mapObject(obj: any): any {
        let resObj: any = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                resObj[key] = obj[key];
            }
        }

        return resObj;
    }

    async createGuestUser(isUserRegistered: boolean): Promise<GuestUser> {
       try {

        const lastGuestUser = await this.guestUserRepository.findOne({
            order: { guest_id: 'DESC' }
          });
      
         
          const nextGuestId = lastGuestUser ? lastGuestUser.guest_id + 1 : 1000;
      
        
          const newGuestUser = this.guestUserRepository.create({
            isUserRegistered,
            guest_id: nextGuestId,
          });
      
         
          return this.guestUserRepository.save(newGuestUser);
       }catch(error){
        console.log("Error in the creating guest user  repository", error.message);
        throw error;
       }
       
      }
    
}