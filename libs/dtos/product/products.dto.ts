import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, isString, Max, Min } from 'class-validator';
import { PRODUCT_STATUS } from 'libs/constants/productConstant';


export class CreateProductDto {
    @IsString()
    @IsOptional()
    product_name: string;

    @IsNumber()
    @IsOptional()
    productId: number;

    @IsString()
    @IsOptional()
    description: string;


    @IsNumber()
    @IsOptional()
    categoryId: number;

    @IsNumber()
    @IsOptional()
    variantId: number;

    @IsNumber()
    @IsOptional()
    brandId: number;

    @IsNumber()
    @IsOptional()
    storeId: number;

    @IsArray()
    @IsOptional()
    variants: CreateProductVariantDTO[];
}

export class CreateProductVariantDTO {

    @IsNumber()
    @IsOptional()
    variantId: number;

    @IsNumber()
    @IsNotEmpty({ message: "Product ID is required" })
    productId: number;

    @IsNumber({}, { message: "Selling Price must be a number" })
    @IsNotEmpty({ message: "sellingPrice should not be empty" })
    sellingPrice: number;

    @IsString()
    @IsOptional()
    description: string;

    @IsNumber()
    @IsNotEmpty({ message: "MRP is required" })
    mrp: number;

    @IsNumber()
    @IsNotEmpty({ message: "Tax is required" })
    tax: number;

    @IsString()
    @IsOptional()
    color: string;

    @IsString()
    @IsOptional()
    size: string;

    @IsString()
    @IsOptional()
    material: string;

    @IsString()
    @IsOptional()
    productDimensions: string;

    @IsString()
    @IsOptional()
    weight: string;

    @IsNumber()
    @IsNotEmpty({ message: "Product Quantity is required" })
    Quantity: number;

    @IsString()
    @IsOptional()
    product_status: PRODUCT_STATUS;
}

export class CreateReviewDto {
    @IsNumber()
    orderId: number;

    @IsNumber()
    productId: number;

    @IsNumber()
    @Min(1)
    @Max(5)
    rating: number; // Rating from 1 to 5

    @IsOptional()
    @IsString()
    review: string;

    @IsOptional()
    @IsArray()
    @ArrayNotEmpty()
    images: string[];

}