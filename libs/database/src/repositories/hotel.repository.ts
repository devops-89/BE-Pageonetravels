import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Hotel } from "../entities/hotel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {ICreateHotel} from '../../../../libs/interfaces/ourHotel/hotel.interface';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";
@Injectable()
export class HotelierRepositoryService {
    constructor(
        @InjectRepository(Hotel)
        private readonly hotelRepo: Repository<Hotel>
    ){}
    async createHotel(reference_id: string, input: ICreateHotel) {
        console.log("main_image",input.main_image)
        console.log("gallry_image: ",input.gallery_images);
    const newHotel = this.hotelRepo.create({
        name: input.name,
        description: input.description,
        type: input.type,
        star_rating: input.star_rating,
        address_line: input.address_line,
        city: input.city,
        state: input.state,
        country: input.country,
        postal_code: input.postal_code,
        latitude: input.latitude,
        longitude: input.longitude,
        contact_name: input.contact_name,
        contact_email: input.contact_email,
        contact_phone: input.contact_phone,
        alternate_phone: input.alternate_phone,
        check_in_time: input.check_in_time,
        check_out_time: input.check_out_time,
        cancellation_policy: input.cancellation_policy,
        child_policy: input.child_policy,
        pet_policy: input.pet_policy,
        main_image: input.main_image,            // <-- already string
        gallery_images: input.gallery_images,    // <-- already string[]
        base_price: input.base_price,
        tax_percentage: input.tax_percentage,
        amenities: {
            wifi: input.amenities.wifi,
            parking: input.amenities.parking,
            ac: input.amenities.ac,
            restaurant: input.amenities.restaurant,
            pool: input.amenities.pool,
            gym: input.amenities.gym,
            spa: input.amenities.spa,
            bar: input.amenities.bar,
            laundry: input.amenities.laundry,
        },
        user_id: reference_id,
    });

    return await this.hotelRepo.save(newHotel);
}

    async updateHotel(reference_id:string,hotel_id: string, input: any) {
        // Find the existing hotel
        const existingHotel = await this.hotelRepo.findOne({ where: { hotel_id: hotel_id }  });
        if (!existingHotel) {
            throw { message: "Please provide a valid Hotel ID.", statusCode: ERROR_CODES.BAD_REQUEST };
        }
        // Prepare update data
        const updateData: Partial<Hotel> = {
            name: input.name,
            description: input.description,
            type: input.type,
            star_rating: input.star_rating,
            address_line: input.address_line,
            city: input.city,
            state: input.state,
            country: input.country,
            postal_code: input.postal_code,
            latitude: input.latitude,
            longitude: input.longitude,
            contact_name: input.contact_name,
            contact_email: input.contact_email,
            contact_phone: input.contact_phone,
            alternate_phone: input.alternate_phone,
            check_in_time: input.check_in_time,
            check_out_time: input.check_out_time,
            cancellation_policy: input.cancellation_policy,
            child_policy: input.child_policy,
            pet_policy: input.pet_policy,
            base_price: input.base_price,
            tax_percentage: input.tax_percentage,
            // currency: input.currency,
            amenities : {
                wifi : input.amenities.wifi,
                parking : input.amenities.parking,
                ac : input.amenities.ac,
                restaurant : input.amenities.restaurant,
                pool : input.amenities.pool,
                gym : input.amenities.gym,
                spa : input.amenities.spa,
                bar : input.amenities.bar,
                laundry : input.amenities.laundry,
            },
            user_id:reference_id
        };
      if (input.main_image) {
    updateData.main_image = input.main_image;  
}
if (input.gallery_images) {
    updateData.gallery_images = input.gallery_images; 
}
        // Update the hotel
        await this.hotelRepo.update(hotel_id, updateData);
        // Return the updated hotel
        return await this.hotelRepo.findOne({ where: { hotel_id:hotel_id } });
    }
    async findHotelierbyId(hotelId: string): Promise<Hotel | null> {
        try {
            const hotel = await this.hotelRepo.findOne({
                where: { hotel_id: hotelId }  // Changed from hotel_id to id
            });
            return hotel || null;
        } catch (error) {
            console.log('Error finding hotel by ID:', error);
            throw error;
        }
    }
    async getAllHotel(){
        try{
            const hotel = await this.hotelRepo.find();
            return hotel;
        }catch(error){
            console.log(error);
            throw error;
        }
    }
    async getSingleHotel(hotel_id:string){
        try{
            const hotel = await this.hotelRepo.findOne({where: { hotel_id: hotel_id }});
            return hotel;
        }catch(error){
            console.log(error);
            throw error;
        }
    }
}











