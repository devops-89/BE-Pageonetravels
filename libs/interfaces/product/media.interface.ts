interface AddProductMedia {
    product_id?: number;
    media_id?: number;
    variant_id: number;
    images: { [key: string]: string };
    videos?: string[]
}