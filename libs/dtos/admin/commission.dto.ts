import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddCommissionDto{

@IsString()
@IsNotEmpty()
type: string

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
    type: string

    @IsNumber()
    @IsNotEmpty()
    percentage: number

    @IsBoolean()
    @IsNotEmpty()
    status: boolean
}
