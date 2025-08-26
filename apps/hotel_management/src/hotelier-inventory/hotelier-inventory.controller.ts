import { Controller, Body, Post } from '@nestjs/common';
import { HotelierInventoryService } from './hotelier-inventory.service';
import { SearchAvailabilityDto } from '../../../../libs/dtos/hotelier/hotelier-inventory.dto';
@Controller('hotelier-inventory')
export class HotelierInventoryController {
    constructor(private readonly svc: HotelierInventoryService) {}
    @Post('search') search(@Body() dto: SearchAvailabilityDto) {
        return this.svc.searchByCity(dto);
    }
}