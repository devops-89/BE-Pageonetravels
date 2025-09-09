import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export interface ICreateHotelRoom {
    max_guests?:number;
    hotel_id: string;
    room_type: string;
    room_title: string;
    room_description?: string;
    max_adults?: number;
    max_children?: number;
    base_price: number;
    tax_percentage?: number;
    currency?: string;
    main_image: string;
    gallery_images?: string[];
    amenities : {
      wifi: boolean;
      ac: boolean;
      tv: boolean;
      balcony: boolean;
      attached_bathroom: boolean;
      room_service: boolean;
      breakfast_included: boolean;
    };
    number_of_rooms?: number;
    available_rooms?: number;
  }
  