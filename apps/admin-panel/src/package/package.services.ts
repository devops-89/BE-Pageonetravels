import { Injectable } from "@nestjs/common";
import { UserRepositoryService } from '../../../../libs/database/src';


@Injectable()
export class PackageService {
    constructor(
        private readonly UserModel: UserRepositoryService,
    ){}


    

}