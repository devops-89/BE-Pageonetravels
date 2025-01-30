import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional,IsUUID } from 'class-validator';

export class AddTestimonialDto{
    

    @IsString()
    @IsNotEmpty()
    testimonial_description:string

    @IsString()
    @IsNotEmpty()
    testimonial_name:string

    @IsString()
    @IsNotEmpty()
    testimonial_profession:string 

    @IsString()
    @IsNotEmpty()
    status:string
}

export class UpdateTestimonialDto{

    @IsString()
    @IsNotEmpty()
    testimonial_id: string


    @IsString()
    @IsOptional()
    testimonial_description:string

    @IsString()
    @IsOptional()
    testimonial_name:string

    @IsString()
    @IsOptional()
    testimonial_profession:string 

    @IsString()
    @IsOptional()
    status:string 
} 