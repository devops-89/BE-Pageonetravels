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
            const { city, country, houseNo, isDefault, postal_code, street, state,  addressType } = input;
            const isDefaultValue = isDefault || false;
            const addType = addressType || "HOME";
            
            const address = this.addressRepository.create({
                city,
                country,
                houseNo,
                isDefault:isDefaultValue,
                postal_code,
                state,
                street,
                addressType : addType,
            });

            const res = await this.addressRepository.save(address);
            return res;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAllAddressesForUser(userId: string) {
        const addresses = await this.addressRepository.find({ where: { user: { id: userId } } });

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

    async updateAddress(input: AddressI.UpdateAdress): Promise<void> {
        try {
            const { city, country, houseNo, isDefault, postal_code, street, addressType, id, userId } = input;

            const updateFields = this.mapObject({ city, country, houseNo, isDefault, postal_code, street, addressType });
            // await this.addressRepository.update({ id, user: { id: userId } }, updateFields);
            return;
        } catch (error) {
            throw error;
        }
    }

    async updateStoreAddress(id:string, input: AddressI.UpdateAdress): Promise<void> {
        try {
            const { city, country, houseNo, isDefault, postal_code, street, addressType, userId } = input;

            const updateFields = this.mapObject({ city, country, houseNo, isDefault, postal_code, street, addressType });
            // await this.addressRepository.update({ id, user: { id: userId } }, updateFields);
            return;
        } catch (error) {
            console.log("Error in update store addreess query",error)
            throw error;
        }
    }

    async updateDefaultByIds(ids: string[], userId: string): Promise<void> {
        try {
   
            await this.addressRepository.update({ id: In(ids), user: { id: userId } }, { isDefault: false });
            return;
        } catch (error) {
            throw error;
        }
    }

    async getAddressesById(id: string) {
        // const address = await this.addressRepository.findOne({where:{(id)}});
        // return address
    }
}