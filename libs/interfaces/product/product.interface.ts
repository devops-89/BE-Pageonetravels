import { bool } from "aws-sdk/clients/signer";
import { PRODUCT_STATUS } from "../../../libs/constants/productConstant";

// export declare namespace ProductSectorI{
//     interface addProductSector {
//         sector_name:string
//     }
//     interface updateProductSector {
//         productsectorid:number,
//         sector_name?:string
//     }
// }


// export declare namespace CategoryI{
//     interface addCategory {
//         category_name:string,
//         productsectorid:number
//     }
//     interface updateCategory {
//         productsectorid:number,
//         category_name?:string
//     }
//     interface filterCategory {
//         productsectorid:number,
//         category_name?:string
//     }
// }

// export declare namespace SubcategoryI{
//     interface addSubCategory {
//         subcategory_name : string,
//         category_id : number
//     }
//     interface updateSubCategory {
//         subcategory_id:number,
//         subcategory_name:string,
//         category_id:number
//     }
//     interface filterSubCategory {
//         subcategory_name:string,
//         category_id:number
//     }
// }
export interface IProduct {
  productId?: number;
  product_name: string;
  description?: string;
  sellerId?: number;
  categoryId: number;
  brandId?: number;
  storeId?: number;
  product_status?: PRODUCT_STATUS
  variants?: IProductVariant[];
}
export interface IUpdateProduct {
  product_id?: number;
  product_name?: string;
  description?: string;
  categoryId?: number;
  brandId?: number;
  storeId?: number;
}
export interface IProductVariant {
  variant_id?: number;
  productId: number;
  // product: number;
  sellingPrice: number;
  tax: number;
  mrp: number;
  color: string;
  size?: string;
  material?: string;
  productDimensions?: string;
  weight?: string;
  discount?: number;
  quantity?: number;
  product_status: PRODUCT_STATUS;
  // media: IProductMedia;
  description?: string;
}

export interface IProductMedia {
  media_id?: number;
  variant_id: number;
  images?: { [key: string]: string };
  videos?: string[];
}

export interface IProductFilter {
  productName?: string,
  reference_id?: number,
  isSeller?: boolean,
  productStatus?: string
  productId?: number,
  page?: number;
  pageSize?: number,
  categoryId?: number,
  brandId?: number,
  product_status?:string
}
export interface ICart {
  userId: number,
  variantId: number,
  quantity: number
}

export interface PaymentJson {
  amount: number,
  currency: string,
  receipt: string,
  payment_capture: number // Auto capture payment
}