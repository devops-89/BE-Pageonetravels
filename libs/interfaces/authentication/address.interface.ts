export declare namespace AddressI 
{

    interface AddAdress
    {
        street: string,
        houseNo: string,
        city: string,
        state: string,
        country: string,
        postalCode: string,
        isDefault?:boolean,
        userId?: string,
        addressType: string
    }

    interface UpdateAdress extends Partial<AddAdress>
    {
        id: string;
    }
}