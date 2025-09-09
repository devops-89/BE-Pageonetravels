import { HotelierInventoryRepositoryService } from './hotelier-inventory.repository';
import { HotelierRepositoryService } from './hotel.repository';
import { Injectable, BadRequestException } from '@nestjs/common';
import { HotelRoomTypes } from '../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreateHotelRoom } from '../../../interfaces/ourHotel/hotel-room.interface';
import { ERROR_CODES } from '../../../constants/commonConstants';
@Injectable()
export class HotelierRoomTypesRepositoryService {
    constructor(
        @InjectRepository(HotelRoomTypes)
        private readonly hotelRoomRepo: Repository<HotelRoomTypes>,
        private readonly hotelierRepositoryService: HotelierRepositoryService
    ) {}
    /**
     * Create a new Room Type for a Hotel
     */
    async createRoom(body: ICreateHotelRoom) {
        try {
            // First verify the hotel exists
            const hotel = await this.hotelierRepositoryService.findHotelierbyId(body.hotel_id);
            if (!hotel) {
                throw new BadRequestException({
                    message: 'Please provide a valid Hotel ID.',
                    statusCode: ERROR_CODES.BAD_REQUEST,
                });
            }
            // handle images
            // const upload = body.gallery_images || [];
            //  oconstriginalNames = upload.map((file) => file.path).join(', ');
            // const mainImage = body.main_image?.path || null;
            console.log("body amenities:",body?.amenities);
            console.log("body wifi: ",body?.amenities?.wifi)
            const newRoom = this.hotelRoomRepo.create({
                hotel,
                room_type: body.room_type,
                room_title: body.room_title,
                room_description: body.room_description,
                max_adults: body.max_adults,
                max_children: body.max_children,
                base_price: body.base_price,
                tax_percentage: body.tax_percentage,
                currency: body.currency,
                main_image: body.main_image,
                gallery_images: body.gallery_images,
                //const amenities = body.amenities || {};
                amenities:{
                  wifi:body.amenities.wifi ?? false,
                  ac:body.amenities.ac ?? false,
                  tv:body.amenities.tv,
                  balcony:body.amenities.balcony,
                  attached_bathroom:body.amenities.attached_bathroom,
                  room_service:body.amenities.room_service,
                  breakfast_included:body.amenities.breakfast_included
                },
                number_of_rooms: body.number_of_rooms,
                available_rooms: body.available_rooms,
                // max_guests: body.max_guests || body.max_adults + body.max_children,

            });
            return await this.hotelRoomRepo.save(newRoom);
        } catch (error) {
            console.error('Error creating hotel room:', error);
            throw error;
        }
    }
    /**
     * Find a room type by ID
     */
    async findById(id: string) {
        return this.hotelRoomRepo.findOne({
            where: { id },
            relations: ['hotel', 'inventory', 'bookings'],
        });
    }
    /**
     * Find all room types for a given hotel
     */
 async findByHotel(hotelId: string) {
  return this.hotelRoomRepo.find({
    where: { hotel: { hotel_id: hotelId } },   // ✅ correct relation filter
    relations: ['hotel', 'inventory'],
    order: { created_at: 'DESC' },
  });
}
    /**
     * Update room info (basic details, pricing, amenities)
     */
    async updateRoom(id: string, data: Partial<HotelRoomTypes>) {
        await this.hotelRoomRepo.update(id, data);
        return this.findById(id);
    }
    /**
     * Reduce available rooms (booking flow)
     */
    async reduceAvailableRooms(roomTypeId: string, count: number) {
        const room = await this.findById(roomTypeId);
        if (!room) throw new BadRequestException('Room not found');
        if (room.available_rooms < count) {
            throw new BadRequestException('Not enough available rooms');
        }
        room.available_rooms -= count;
        return await this.hotelRoomRepo.save(room);
    }
    /**
     * Increase available rooms (cancellation flow)
     */
    async increaseAvailableRooms(roomTypeId: string, count: number) {
        const room = await this.findById(roomTypeId);
        if (!room) throw new BadRequestException('Room not found');
        room.available_rooms += count;
        return await this.hotelRoomRepo.save(room);
    }
    /**
     * Delete room type
     */
    async deleteRoom(id: string) {
        return this.hotelRoomRepo.delete(id);
    }
}











