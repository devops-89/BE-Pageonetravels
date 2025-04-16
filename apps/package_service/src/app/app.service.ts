import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    createAPackage(body) {
        return 'This action adds a new package';
    }
  
}
