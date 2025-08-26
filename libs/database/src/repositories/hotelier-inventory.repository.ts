// inventory/inventory.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomInventory } from '../entities/hotelier-room-inventory.entity';
import { Repository, DataSource } from 'typeorm';
@Injectable()
export class HotelierInventoryRepositoryService {
    constructor(
        @InjectRepository(RoomInventory)
        private readonly repo: Repository<RoomInventory>,
        private readonly dataSource: DataSource,
    ) {}
    findRange(roomTypeId: number, start: string, endExclusive: string) {
        return this.repo
            .createQueryBuilder('ri')
            .where('ri.roomType = :roomTypeId', { roomTypeId })
            .andWhere('ri.date >= :start AND ri.date < :endExclusive', {
                start,
                endExclusive,
            })
            .getMany();
    }
    // Transactional adjust with SELECT FOR UPDATE
    async adjustRangeWithLock(
        roomTypeId: string,
        start: string,
        endExclusive: string,
        delta: number,
    ) {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();
        try {
            const rows = await qr.manager
                .createQueryBuilder(RoomInventory, 'ri')
                .setLock('pessimistic_write')
                .where('ri.roomType = :roomTypeId', { roomTypeId })
                .andWhere('ri.date >= :start AND ri.date < :endExclusive', {
                    start,
                    endExclusive,
                })
                .getMany();
            // ensure continuous coverage
            const days = dateSpan(start, endExclusive);
            if (rows.length !== days.length)
                throw new Error(
                    'Inventory not initialized for the whole range',
                );
            // validate availability when decreasing
            if (delta < 0) {
                for (const r of rows) {
                    if (r.available_rooms + delta < 0)
                        throw new Error(
                            `Insufficient inventory on ${r.date}`,
                        );
                }
            }
            for (const r of rows) {
                r.available_rooms += delta;
                await qr.manager.save(RoomInventory, r);
            }
            await qr.commitTransaction();
            return true;
        } catch (e) {
            await qr.rollbackTransaction();
            throw e;
        } finally {
            await qr.release();
        }
    }
  async upsertInventoryRange(
  roomTypeId: string,
  dates: string[],
  totalRooms: number,
  basePrice: number,
) {
  await this.repo
    .createQueryBuilder('inventory')
    .insert()
    .into(RoomInventory)
    .values(
    dates.map((d) => ({
        roomType: { id: roomTypeId } as any,  // tell TS it's a partial entity
        date: d,
        total_rooms: totalRooms,
        available_rooms: totalRooms,
        price: basePrice,
    })),
)
    .orIgnore()
    .execute();
  return { createdOrSkipped: dates.length };
}
    async upsertInventory(
        roomTypeId: string,
        date: string,
        total: number,
        available: number,
        price: number,
    ) {
        return this.repo
            .createQueryBuilder()
            .insert()
            .into(RoomInventory)
            .values({
                roomType: { id: roomTypeId },
                date,
                total_rooms: total,
                available_rooms: available,
                price,
            })
            .orIgnore()
            .execute();
    }
}
// small pure helper
function dateSpan(start: string, endExclusive: string): string[] {
    const out: string[] = [];
    const d0 = new Date(start);
    const d1 = new Date(endExclusive);
    for (let d = new Date(d0); d < d1; d.setDate(d.getDate() + 1)) {
        out.push(d.toISOString().slice(0, 10));
    }
    return out;
}











