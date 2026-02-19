export interface IDashboardStats {
    totalUsers: number;
    totalHotels: number;
    totalCancelHotels: number;
    totalCancelFlights: number;
    totalSelfDrive: number;
    totalCabs: number;
    totalFlights: number;
    totalHelicopters:number;
}

export interface IFlightStats {
    totalCancelFlights: number;
    totalFlights: number;
}

export interface IHotelStats {
    totalCancelHotels: number;
    totalHotels: number;

}

export interface IUserStats {
    totalUsers: number;
}

export interface ISelfDriveStats {
    data: {
        totalSelfDrive: number;
    };
    message: string;
}

export interface IHelicopterStats{
    data: {
        totalHelicopter:number;
    };
    message:string;
}

export interface ICabStats {
    data: {
        totalCabs: number;
    };
    message: string;
}
