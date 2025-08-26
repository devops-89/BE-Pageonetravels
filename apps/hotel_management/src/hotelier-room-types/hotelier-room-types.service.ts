import { HotelierInventoryRepositoryService } from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
import { HotelierRoomTypesRepositoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {} from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
//import { InventoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
import { CreateHotelRoomDto } from '../../../../libs/dtos/hotelier/hotelier-room-type.dto';
@Injectable()
export class HotelierRoomTypesService {
    constructor(private readonly roomTypesRepositoryService: HotelierRoomTypesRepositoryService, private readonly hotelierInventoryRepositoryService: HotelierInventoryRepositoryService) {}
    async addRoom(body: CreateHotelRoomDto) {
        try {
            await this.roomTypesRepositoryService.createRoom(body);
            return { message: `Hotel Room Created Successfully`, data: body };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async generateInventory(roomTypeId: string, startDate: string, days: number) {
        const roomType = await this.roomTypesRepositoryService.findById(roomTypeId);
        if (!roomType) throw new NotFoundException('Room type not found');
        const dates = span(startDate, days);
        for (const d of dates) {
            await this.hotelierInventoryRepositoryService.upsertInventory(roomTypeId, d, roomType.number_of_rooms, roomType.available_rooms, roomType.base_price);
        }
        return {
            message: 'Inventory generated successfully',
            data: { createdOrSkipped: dates.length },
        };
    }
}
function span(start: string, days: number): string[] {
    const out: string[] = [];
    const d = new Date(start);
    for (let i = 0; i < days; i++) {
        out.push(new Date(d.getTime() + i * 86400000).toISOString().slice(0, 10));
    }
    return out;
}