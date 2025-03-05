interface Baggage {
    AirlineCode: string;
    FlightNumber: string;
    WayType: number;
    Code: string;
    Description: number;
    Weight: number;
    Currency: string;
    Price: number;
    Origin: string;
    Destination: string;
}

interface MealDynamic {
    AirlineCode: string;
    FlightNumber: string;
    WayType: number;
    Code: string;
    Description: number;
    AirlineDescription: string;
    Quantity: number;
    Currency: string;
    Price: number;
    Origin: string;
    Destination: string;
}

interface SeatDynamic {
    AirlineCode: string;
    FlightNumber: string;
    CraftType: string;
    Origin: string;
    Destination: string;
    AvailablityType: number;
    Description: number;
    Code: string;
    RowNo: string;
    SeatNo: string | null;
    SeatType: number;
    SeatWayType: number;
    Compartment: number;
    Deck: number;
    Currency: string;
    Price: number;
}

interface Passenger {
    pax_type: number; // 1 = Adult, 2 = Child, 3 = Infant
    first_name: string;
    last_name: string;
    Baggage?: Baggage[];
    MealDynamic?: MealDynamic[];
    SeatDynamic?: SeatDynamic[];
    selectedBaggage?: Baggage;
    selectedMeal?: MealDynamic;
    selectedSeat?: SeatDynamic;
}

interface PassengerDetails {
    adult?: Passenger[];
    child?: Passenger[];
    infant?: Passenger[];
}

export function calculateTotalPrice(passengerDetails: PassengerDetails): number {
    let totalFare = 0;

    // Function to handle Baggage
    function handleBaggage(passengers: Passenger[]) {
        passengers.forEach(passenger => {
            if (passenger.pax_type === 1 || passenger.pax_type === 2) { // Adult or Child
                if (passenger.Baggage && passenger.Baggage.length > 0) {
                    const selectedBaggage = passenger.Baggage.find(option => option.Code === "NoBaggage");
                    if (selectedBaggage) {
                        totalFare += selectedBaggage.Price;
                        passenger.selectedBaggage = selectedBaggage;
                    }
                } else {
                    console.log(`No baggage options available for passenger: ${passenger.first_name} ${passenger.last_name}`);
                }
            }
        });
    }

    // Function to handle MealDynamic
    function handleMealDynamic(passengers: Passenger[]) {
        passengers.forEach(passenger => {
            if (passenger.pax_type === 1 || passenger.pax_type === 2) { // Adult or Child
                if (passenger.MealDynamic && passenger.MealDynamic.length > 0) {
                    const selectedMeal = passenger.MealDynamic.find(option => option.Code === "NoMeal");
                    if (selectedMeal) {
                        totalFare += selectedMeal.Price;
                        passenger.selectedMeal = selectedMeal;
                    }
                } else {
                    console.log(`No meal options available for passenger: ${passenger.first_name} ${passenger.last_name}`);
                }
            }
        });
    }

    // Function to handle SeatDynamic
    function handleSeatDynamic(passengers: Passenger[]) {
        passengers.forEach(passenger => {
            if (passenger.pax_type === 1 || passenger.pax_type === 2) { // Adult or Child
                if (passenger.SeatDynamic && passenger.SeatDynamic.length > 0) {
                    const selectedSeat = passenger.SeatDynamic.find(option => option.Code === "NoSeat");
                    if (selectedSeat) {
                        totalFare += selectedSeat.Price;
                        passenger.selectedSeat = selectedSeat;
                    }
                } else {
                    console.log(`No seat options available for passenger: ${passenger.first_name} ${passenger.last_name}`);
                }
            }
        });
    }

    // Extract passengers from passengerDetails
    const passengers: Passenger[] = [
        ...(passengerDetails.adult || []),
        ...(passengerDetails.child || []),
        ...(passengerDetails.infant || [])
    ];

    // Process Baggage, MealDynamic, and SeatDynamic
    handleBaggage(passengers);
    handleMealDynamic(passengers);
    handleSeatDynamic(passengers);

    // Return the calculated total fare
    return totalFare;
}