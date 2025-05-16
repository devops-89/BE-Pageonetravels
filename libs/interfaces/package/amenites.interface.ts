import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export interface InsertAmenites {
        amenite_name:string,
        amenite_image:CustomFile
}

export interface UpdateAmenites {
    amenite_name:string,
    amenite_image?:CustomFile
}



