import { HotelierInventoryRepositoryService } from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
import { HotelierRoomTypesRepositoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {} from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
//import { InventoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotelier-room-type.dto';
import {InventoryItemDto} from "../../../../libs/dtos/hotelier/hotelier-inventory.dto";
import { S3FileService } from '../../../../libs/S3-Service/s3File.service';
@Injectable()
export class HotelierRoomTypesService {
    constructor(private readonly roomTypesRepositoryService: HotelierRoomTypesRepositoryService, private readonly hotelierInventoryRepositoryService: HotelierInventoryRepositoryService, private readonly s3FileService: S3FileService) {}
    async addRoom(body: CreateHotelRoomDto, mainImageFile, galleryImageFile) {
        try {
            if (mainImageFile) {
                const mainPath = `hotelier-room-type/main/${Date.now()}-${mainImageFile.originalname}`;
                const s3path = await this.s3FileService.s3FileUpload(mainImageFile.buffer, mainPath);
                console.log('main image:', s3path);
                body.main_image = s3path;
            }

            // Upload Gallery Image
            if (galleryImageFile) {
                const galleryImageUrls = await Promise.all(
                    galleryImageFile.map((file) => {
                        const filePath = `hotelier-room-type/gallery/${Date.now()}-${file.originalname}`;
                        return this.s3FileService.s3FileUpload(file.buffer, filePath);
                    })
                );

                body.gallery_images = galleryImageUrls;
            }

            console.log("body payload:",body);

            await this.roomTypesRepositoryService.createRoom(body);
            return { message: `Hotel Room Created Successfully`, data: body };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

// get Rooms by HotelId
async getRoomsByHotel(hotelId: string) {
  try {
    const rooms = await this.roomTypesRepositoryService.findByHotel(hotelId);

    if (!rooms.length) {
      throw new NotFoundException(`No rooms found for hotel ID: ${hotelId}`);
    }

    return {
      success: true,
      message: `Rooms fetched successfully for hotel ID: ${hotelId}`,
      data: rooms,
    };
  } catch (error) {
    console.error('Error fetching rooms by hotelId:', error);
    throw error; 
  }
}

// generate Inventory for the Perticular Room Category
      async generateInventory(roomTypeId: string, inventory: InventoryItemDto[]) {
    const roomType = await this.roomTypesRepositoryService.findById(roomTypeId);
    if (!roomType) throw new NotFoundException('Room type not found');

    const totalRooms: number = roomType.number_of_rooms;
    const defaultAvail: number =
      typeof roomType.available_rooms === 'number'
        ? roomType.available_rooms
        : totalRooms;

    const rows = inventory.map((item) => {
      const isClosed = !item.available;
      const availableRooms = isClosed
        ? 0
        : typeof item.rooms === 'number'
          ? item.rooms
          : defaultAvail;

      return {
        roomTypeId,
        date: item.date,
        total_rooms: totalRooms,
        available_rooms: Math.max(0, Math.min(availableRooms, totalRooms)),
        price: typeof item.price === 'number' ? item.price : null, // null => fallback to base price
        is_closed: isClosed,
      };
    });

    const result = await this.hotelierInventoryRepositoryService.upsertMany(roomTypeId, rows);
    return {
      message: 'Inventory generated/updated successfully',
      data: { processed: rows.length, created: result.created, updated: result.updated },
    };
  }
}

