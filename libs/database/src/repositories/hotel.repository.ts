import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Hotel } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";
import {ICreateHotel} from '../../../../libs/interfaces/ourHotel/hotel.interface';

@Injectable()
export class HotelRepositoryService { 
    constructor(
        @InjectRepository(Hotel)
        private readonly hotelRepo: Repository<Hotel>
    ){}

    async createHotel(input:ICreateHotel){
        const newHotel = this.hotelRepo.create({
            name : input.name,
            description : input.description,
            type : input.type,
            star_rating : input.star_rating,
            address_line : input.address_line,
            city : input.city,
            state : input.state,
            country : input.country,
            postal_code : input.postal_code,
            latitude : input.latitude,
            longitude : input.longitude,
            contact_name : input.contact_name,
            contact_email : input.contact_email,
            contact_phone : input.contact_phone,
            alternate_phone : input.alternate_phone,
            check_in_time : input.check_in_time,
            check_out_time : input.check_out_time,
            cancellation_policy : input.cancellation_policy,
            child_policy : input.child_policy,
            pet_policy : input.pet_policy,
            main_image : input.main_image,
            gallery_images : input.gallery_images,
            base_price : input.base_price,
            tax_percentage : input.tax_percentage,
            currency : input.currency,
            wifi : input.wifi,
            parking : input.parking,
            ac : input.ac,
            restaurant : input.restaurant,
            pool : input.pool,
            gym : input.gym,
            spa : input.spa,
            bar : input.bar,
            user_id: input.user_id,
            laundry : input.laundry,
        });

        const result = await this.hotelRepo.save(newHotel);
        return result;
    }

    // async findHotelierbyId(hotelierId:string){
    //     try{
    //         console.log("?????//,./,//?",hotelierId);
    //     }catch(error){
    //         console.log(error);
    //     }
    // }

    async findHotelierbyId(hotelId: string): Promise<Hotel | null> {
        try {
            const hotel = await this.hotelRepo.findOne({
                where: { hotel_id: hotelId }  // Changed from hotel_id to id
            });
            return hotel || null;
        } catch (error) {
            console.error('Error finding hotel by ID:', error);
            throw new Error('Failed to find hotel');
        }
    }




}