import { AddressI } from "../authentication/address.interface";

export namespace BrandI {
    export interface addBrand {
        brand_name: string;
        brand_logo?: string;
        description: string;
        id:number;
    }

    export interface updateBrand {
        brand_name?: string;
        brand_logo?: string;
        description?: string;
        
    }

    export interface filterBrand {
        brand_id?: number;
        brand_name?: string;
    }
}

export interface addStore {
    store_id?: number;
    store_name: string;
    description?: string;
    status?: string;
    address_id: number;
    store_logo?:string
    user_id:number
}
export interface UpdateStoreI {
    store_id: number;
    store_name?: string;
    description?: string;
    address_id?: number;
    store_logo?:string
}
export interface getStore {
    group?:string;
    referenceId?:number;
    page?: number;
    pageSize?: number;
    sortBy?: {
        price: 'ASC' | 'DESC';
        createdAt: 'ASC' | 'DESC';
    };
    name?: string;
    status?: 'BLOCKED' | 'UNBLOCKED';
}
