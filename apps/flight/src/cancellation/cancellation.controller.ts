import { Controller,Post,Body } from '@nestjs/common';
import { CancellationService } from './cancellation.service';
import {GetCancellationChargesDto} from "../../../../libs/dtos/flight/flight-cancel.dto.js";

@Controller('flight-cancel')
export class CancellationController {

    constructor(private readonly cancellationServices: CancellationService){}

    @Post('get-charges')
      getCancellationCharges(@Body() dto: GetCancellationChargesDto){
             return this.cancellationServices.getCancellationCharges(dto);
      }



}
