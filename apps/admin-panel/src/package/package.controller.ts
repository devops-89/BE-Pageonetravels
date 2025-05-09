import { Controller } from "@nestjs/common";
import { PackageService } from "./package.services";


@Controller('package')
export class PackageController {
    constructor(
        private readonly packageService: PackageService
    ){}

    

}