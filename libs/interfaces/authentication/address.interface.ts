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
        userId?: number,
        addressType: string
    }

    interface UpdateAdress extends Partial<AddAdress>
    {
        id: number;
    }
}