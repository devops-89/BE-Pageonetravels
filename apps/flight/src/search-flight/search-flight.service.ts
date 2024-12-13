import { Injectable } from '@nestjs/common';


@Injectable()
export class SearchFlightService {
    constructor() {}

async generateToken(){
    try {
        const url = process.env.FLIGHT_AUTHENTICATION;
        const payload = {
            ClientId: process.env.FLIGHT_CLIENT_ID,
            UserName: process.env.FLIGHT_USERNAME,
            Password: process.env.FLIGHT_PASSWORD,
            EndUserIp: process.env.FLIGHT_ENDUSERIP,
          };
        

    }catch(){

    }


    async searchFlight(){
        try {

        }catch(error){

        }
    }
}


}
