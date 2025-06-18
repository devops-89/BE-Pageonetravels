import { Injectable } from '@nestjs/common';
// import axios from 'axios';
import { GenerateTokenService } from '../search-flight/generateToken.service';
import {GetCancellationChargesDto} from "../../../../libs/dtos/flight/flight-cancel.dto";

@Injectable()
export class CancellationService {

    constructor(private readonly generateToken:GenerateTokenService){}

    async getCancellationCharges(dto:GetCancellationChargesDto){

        const {EndUserIp:ipaddress}= dto;

        // generate Token
         const tboToken=await this.generateToken.getToken(ipaddress);
        return tboToken;

    //     const url ='http://api.tektravels.com/BookingEngineService_Air/AirService.svc/rest/GetCancellationCharges';

    // try {
    //   const response = await axios.post(url, dto);
    //   return response.data;
    // } catch (error) {
    //   console.error('Error fetching cancellation charges:', error.message);
    //   throw new Error('Failed to get cancellation charges.');
    // }
       
    }
}
