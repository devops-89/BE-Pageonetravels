import { Injectable } from '@nestjs/common';

@Injectable()
export class FlightDetailService {
    getData(): { message: string } {
        return { message: 'Hello API' };
    }
}
