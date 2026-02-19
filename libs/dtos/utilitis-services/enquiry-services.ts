import { IsEnum } from 'class-validator';
import {EnquiryType} from '//database';

export class EnquiryDto {
    @IsEnum(EnquiryType, {
        message: `Invalid enquiry type. Valid values are: ${Object.values(EnquiryType).join(', ')}`
    })
    type: EnquiryType;
}
