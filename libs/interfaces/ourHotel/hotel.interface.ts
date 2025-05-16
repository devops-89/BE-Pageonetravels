import { CustomFile } from '../../../apps/hotel_management/src/utils/customtypes';

export interface ICreateHotel {
  name: string;
  description: string;
  type: string;
  star_rating: number;
  address_line: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude?: number;
  longitude?: number;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  alternate_phone?: string;
  check_in_time: string; // Format: HH:mm:ss
  check_out_time: string; // Format: HH:mm:ss
  cancellation_policy: string;
  child_policy?: string;
  pet_policy?: string;
  main_image: CustomFile;
  gallery_images?: CustomFile[];
  base_price: number;
  tax_percentage: number;


  // ✅ Grouped amenities
  amenities: {
    wifi: boolean;
    parking: boolean;
    ac: boolean;
    restaurant: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    bar: boolean;
    laundry: boolean;
  };

  // Optional: user_id (can be added if needed)
  // user_id: string;
}
