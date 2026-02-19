import { IsNotEmpty, IsOptional, IsString,IsNumber,Min, IsUUID } from "class-validator";

export class CreatePackageDayDto {
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    days: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    nights: number;
}


export class PkgIdParams {
   @IsUUID('4')
  @IsNotEmpty()
  pkgday_id: string;
}



export class UpdatePackageDayDto {
    @IsOptional()
    @IsString()
    pkgday_duration: string;
}
