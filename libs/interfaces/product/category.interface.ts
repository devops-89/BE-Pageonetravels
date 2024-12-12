export declare namespace CategoryI{
    interface addCategory {
        category_name:string,
        type:string,
        parent_id?:number,
        category_logo?:string,
        description?:string
    }

    interface IUpdateCategory {
        category_id:number,
        category_name?:string,
        parent_id?:number
        category_logo?:string
        description?:string
    }

    interface filterCategory {
        category_id:number,
        category_name:string
    }

    interface getCategory {
        name?:string;
        page?: number;
        pageSize?: number;
        sortBy?: {
            price: 'ASC' | 'DESC';
            createdAt: 'ASC' | 'DESC';
        };
    }
}