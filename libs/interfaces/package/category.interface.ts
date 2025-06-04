import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export interface InsertCategory {
        category_name:string,
        category_image:CustomFile
}

export interface UpdateCategory {
    category_name:string,
    category_image?:CustomFile
}