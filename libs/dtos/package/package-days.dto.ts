import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePackageDayDto {
    @IsNotEmpty()
    @IsString()
    pkgday_duration: string;
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