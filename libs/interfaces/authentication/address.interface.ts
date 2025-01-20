export declare namespace AddressI 
{

    interface AddAdress
    {
        street: string,
        house_number: string,
        city: string,
        state: string,
        country: string,
        postal_code: string,
        is_default?:boolean,
        user_id?: string,
        
    }

    interface UpdateAdress extends Partial<AddAdress>
    {
        id: string;
    }
}