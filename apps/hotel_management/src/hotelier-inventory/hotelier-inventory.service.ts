import { Injectable } from '@nestjs/common';
import { HotelierInventoryRepositoryService } from '../../../../libs/database/src/repositories/hotelier-inventory.repository';
import { SearchAvailabilityDto } from '../../../../libs/dtos/hotelier/hotelier-inventory.dto';
import {HotelierRoomTypesRepositoryService } from '../../../../libs/database/src/repositories/hotelier-room-types.repository';
@Injectable()
export class HotelierInventoryService {
    constructor(
    private readonly hotelInventoryRepositoryService: HotelierInventoryRepositoryService,
    private readonly rtRepo: HotelierRoomTypesRepositoryService,
  ) {}
  async isRoomTypeAvailable(roomTypeId: number, checkIn: string, checkOut: string, rooms: number) {
    const rows = await this.hotelInventoryRepositoryService.findRange(roomTypeId, checkIn, checkOut);
    if (rows.length !== dateSpan(checkIn, checkOut).length) return false;
    return rows.every(r => r.available_rooms >= rooms);
  }
  // Simple availability search by city
  async searchByCity(dto: SearchAvailabilityDto) {
    // 1) find candidate room types by city (optionally by hotel)
    const qb = (this.rtRepo as any).repo.createQueryBuilder('rt')
      .innerJoin('rt.hotel', 'h')
      .where('h.city = :city', { city: dto.city });
    if (dto.hotelId) qb.andWhere('h.id = :hid', { hid: dto.hotelId });
    const roomTypes = await qb.getMany();
    // 2) check inventory for each
    const available = [];
    for (const rt of roomTypes) {
      const ok = await this.isRoomTypeAvailable(rt.id, dto.checkIn, dto.checkOut, dto.rooms);
      if (ok) available.push(rt);
    }
    return available;
  }
}
function dateSpan(start: string, endExclusive: string): string[] {
  const out: string[] = [];
  const d0 = new Date(start);
  const d1 = new Date(endExclusive);
  for (let d = new Date(d0); d < d1; d.setDate(d.getDate() + 1)) {
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
// inventory/inventory.service.ts