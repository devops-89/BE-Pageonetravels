import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID, IsEnum, IsDecimal } from 'class-validator';
import { COMMISSION } from 'libs/constants/adminConstants';
import { COMMISSION_TYPE,  TYPE_COMMISSION } from '../../../libs/constants/autenticationConstants/userContants';

export class AddCommissionDto{


@IsEnum(COMMISSION_TYPE, { 
    message: `type must be one of the following: ${Object.values(COMMISSION_TYPE).join(', ')}` 
})
@IsNotEmpty()
type: COMMISSION_TYPE;

@IsEnum(TYPE_COMMISSION, { message: 'type must be FIXED or PERCENTAGE' })
@IsNotEmpty()
commission_type: TYPE_COMMISSION;

@IsNotEmpty()
@IsDecimal({ decimal_digits: '0,2' }, { message: 'Percentage must have up to two decimal places' })
percentage: string;

@IsBoolean()
@IsNotEmpty()
status: boolean



}

export class UpdateCommissionDto{

    @IsString()
    @IsNotEmpty()
    commission_id: string 


    @IsEnum(COMMISSION_TYPE, { 
        message: `type must be one of the following: ${Object.values(COMMISSION_TYPE).join(', ')}` 
    })
    @IsNotEmpty()
    type: COMMISSION_TYPE;
    
    @IsEnum(TYPE_COMMISSION, { message: 'type must be FIXED or PERCENTAGE' })
    @IsNotEmpty()
    commission_type: TYPE_COMMISSION;


    @IsNotEmpty()
    @IsDecimal({ decimal_digits: '0,2' }, { message: 'Percentage must have up to two decimal places' })
    percentage: string;

    @IsBoolean()
    @IsNotEmpty()
    status: boolean
} 



