import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    createAEnquiry(body): { message: string } {
        return { message: 'Hello API' };
    }
}
