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
    main_image: string;
    gallery_images?: string[];
    base_price: number;
    tax_percentage: number;
    currency: string;
    wifi: boolean;
    parking: boolean;
    ac: boolean;
    restaurant: boolean;
    pool: boolean;
    gym: boolean;
    spa: boolean;
    bar: boolean;
    user_id:string;
    laundry: boolean;
  }