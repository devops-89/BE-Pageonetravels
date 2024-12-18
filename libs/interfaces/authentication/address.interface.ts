export declare namespace AddressI 
{

    interface AddAdress
    {
        street: string,
        houseNo: string,
        city: string,
        state: string,
        country: string,
        postal_code: string,
        isDefault?:boolean,
        userId?: string,
        addressType: string
    }

    interface UpdateAdress extends Partial<AddAdress>
    {
        id: string;
    }
}