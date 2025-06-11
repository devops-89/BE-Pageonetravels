import { Injectable } from '@nestjs/common';

@Injectable()
export class FlightsService {

  findAll() {
    return `This action returns all flights`;
  }

  findOne(id: number) {
    return `This action returns a #${id} flight`;
  }

  // remove(id: number) {
  //   return `This action removes a #${id} flight`;
  // }
}
