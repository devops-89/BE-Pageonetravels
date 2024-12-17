import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';
import { COMMISSION } from 'libs/constants/adminConstants';

export class AddCommissionDto{

@IsString()
@IsNotEmpty()
type: COMMISSION

@IsNumber()
@IsNotEmpty()
percentage: number

@IsBoolean()
@IsNotEmpty()
status: boolean



}

export class UpdateCommissionDto{

    @IsString()
    @IsNotEmpty()
    commission_id: string


    @IsString()
    @IsNotEmpty()
    type: COMMISSION

    @IsNumber()
    @IsNotEmpty()
    percentage: number

    @IsBoolean()
    @IsNotEmpty()
    status: boolean
}
