import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { PackageDay } from "../entities";

@Injectable()
export class PackageDayRepositoryService {

    constructor(
            @InjectRepository(PackageDay)
            private readonly pkdDayRepository: Repository<PackageDay>,
    ) {}

    


}