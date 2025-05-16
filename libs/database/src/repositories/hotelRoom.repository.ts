import { Injectable } from "@nestjs/common";
import { HotelRoom } from "../entities";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ICreateHotelRoom } from "../../../../libs/interfaces/ourHotel/hotel-room.interface";
import { HotelRepositoryService } from '../../../../libs/database/src/repositories/hotel.repository';
import { ERROR_CODES } from "../../../../libs/constants/commonConstants";

@Injectable()
export class HotelRoomRepositoryService { 

    constructor(
            @InjectRepository(HotelRoom)
            private readonly hotelRoomRepo: Repository<HotelRoom>,
            private readonly hotelRepositoryService: HotelRepositoryService,
        ){}

    
        async createRoom(body: ICreateHotelRoom) {
            try {
                // First verify the hotel 
                const hotel = await await this.hotelRepositoryService.findHotelierbyId(body.hotel_id);
                
                if (!hotel) {
                    throw { message: "Please provide a valid Hotel ID.", statusCode: ERROR_CODES.BAD_REQUEST };
                }
                
                const upload = body.gallery_images;
                const originalNames = upload.map(file =>file.path).join(', ');
                const mainImage = body.main_image.path;

                // Create the new room with the hotel relation
                const newRoom = this.hotelRoomRepo.create({
                    hotel,  // Pass the entire hotel entity
                    room_type: body.room_type,
                    room_title: body.room_title,
                    room_description: body.room_description,
                    max_adults: body.max_adults,
                    max_children: body.max_children,
                    base_price: body.base_price,
                    tax_percentage: body.tax_percentage,
                    currency: body.currency,
                    main_image: mainImage,
                    gallery_images: originalNames,
                    amenities:{
                        wifi: body.amenities.wifi,
                        ac: body.amenities.ac,
                        tv: body.amenities.tv,
                        balcony: body.amenities.balcony,
                        attached_bathroom: body.amenities.attached_bathroom,
                        room_service: body.amenities.room_service,
                        breakfast_included: body.amenities.breakfast_included,
                    },
                    number_of_rooms: body.number_of_rooms,
                    available_rooms: body.available_rooms
                });
        
                const result = await this.hotelRoomRepo.save(newRoom);
                return result;
            } catch (error) {
                console.error('Error creating hotel room:', error);
                throw error;
            }
        }
}