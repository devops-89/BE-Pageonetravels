import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';
import exp from 'constants';

export class AddServiceDto{
    @IsString()
    @IsNotEmpty()
    service_name: string

    @IsString()
    @IsNotEmpty()
    service_status: string

}

export class UpdateServiceDto{
    @IsString()
    @IsNotEmpty()
    service_id : string

    @IsString()
    @IsOptional()
    service_name : string
    
    @IsString()
    @IsOptional()
    service_status: string
}