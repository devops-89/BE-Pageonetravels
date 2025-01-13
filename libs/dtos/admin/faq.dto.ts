import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddFaqDto{ 
    @IsString()
    @IsNotEmpty()
    faq_question:string

    @IsString()
    @IsNotEmpty()
    faq_answer:string

    @IsString()
    @IsNotEmpty()
    faq_status:string
}

export class UpdateFaqDto{
    @IsString()
    @IsNotEmpty()
    faq_id: string 

    @IsString()
    @IsOptional()
    faq_question:string

    @IsString()
    @IsOptional()
    faq_answer:string

    @IsString()
    @IsOptional()
    faq_status:string
}