export interface IDashboardStats {
    totalUsers: number;
    totalHotels: number;
    totalCancelHotels: number;
    totalCancelFlights: number;
    totalPackages: number;
    totalCabs: number;
    totalFlights: number;
    totalHoteliers: number;
}

export interface IFlightStats {
    totalCancelFlights: number;
    totalFlights: number;
}

export interface IHotelStats {
    totalCancelHotels: number;
    totalHotels: number;
    totalHoteliers: number;
}

export interface IUserStats {
    totalUsers: number;
}

export interface IPackageStats {
    totalPackages: number;
}

export interface ICabStats {
    data: {
        totalCabs: number;
    };
    message: string;
} 