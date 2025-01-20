import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LoginSession } from '../entities/loginSession.entity';
import { LoginSessionI } from '../../../interfaces/authentication/loginSession.interface';
import { User } from '../entities/user.entity';
import { LOGIN_BY, SESSION_STATUS } from '../../../constants/autenticationConstants/userContants';
import { Address } from '../entities/address.entity';
import { AddressI } from '../../../interfaces/authentication/address.interface';

@Injectable()
export class AddressRepositoryService {
    constructor(
        @InjectRepository(Address)
        private readonly addressRepository: Repository<Address>
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

    async insertAddress(input: AddressI.AddAdress): Promise<Address> {
        try {
            const { city, country, house_number, is_default, postal_code, street, state } = input;
            const isDefaultValue = is_default || false;
            //const addType = address_type || "HOME";
            
            const address = this.addressRepository.create({
                city,
                country,
                house_number,
                isdefault:isDefaultValue,
                postal_code,
                state,
                street
                // address_type : addType,
            });

            const res = await this.addressRepository.save(address);
            return res;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAllAddressesForUser(user_id: string) {
        const addresses = await this.addressRepository.find({ where: { user: { id: user_id } } });

        if (addresses && addresses.length > 0) {
            return addresses;
        } else {
            return [];
        }
    }

    // async removeAddress(id: string) {
    //     await this.addressRepository.delete({ id });
    //     return;
    // }

    // async updateAddress(input: AddressI.UpdateAdress): Promise<void> {
    //     try {
    //         const { city, country, house_number, is_default, postal_code, street, id, user_id } = input;

    //         const updateFields = this.mapObject({ city, country, house_number, is_default, postal_code, street });
            
    //         // await this.addressRepository.update({ id, user: { id: user_id } }, updateFields);
    //         return;
    //     } catch (error) {
    //         throw error;
    //     }
    // }

    async updateAddress(input: AddressI.UpdateAdress): Promise<void> {
        try {
            const { id, ...updateFields } = input;

            await this.addressRepository.update(id, updateFields);
            } catch (error) {
            console.error('Error in updating address:', error);
            throw error;
        }
    }

    // async updateStoreAddress(id:string, input: AddressI.UpdateAdress): Promise<void> {
    //     try {
    //         const { city, country, house_number, is_default, postal_code, street, user_id } = input;

    //         const updateFields = this.mapObject({ city, country, house_number, is_default, postal_code, street });
    //         // await this.addressRepository.update({ id, user: { id: user_id } }, updateFields);
    //         return;
    //     } catch (error) {
    //         console.log("Error in update store addreess query",error)
    //         throw error;
    //     }
    // }

    async updateDefaultByIds(ids: string[], user_id: string): Promise<void> {
        try {
   
            await this.addressRepository.update({ id: In(ids), user: { id: user_id } }, { isdefault: false });
            return;
        } catch (error) {
            throw error;
        }
    }

    async getAddressesById(id: string): Promise<Address | null> {
        try {
            return await this.addressRepository.findOne({ where: { id } });
        } catch (error) {
            console.error('Error fetching address by ID:', error);
            throw error;
        }
    }  
}