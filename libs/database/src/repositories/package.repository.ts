import { Injectable } from "@nestjs/common";
import { Package } from "../entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PackageRepositoryService {

    constructor(
            @InjectRepository(Package)
            private readonly pkgRepository: Repository<Package>,
    ) {}

    


}