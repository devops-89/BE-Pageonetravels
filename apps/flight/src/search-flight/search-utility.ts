export class FlightValidator {
    static validateOriginDestination(origin: string, destination: string): void {
      if (!origin || !destination) {
        throw ("Origin and destination are required.");
      }
      if (origin === destination) {
        throw ("Origin and destination cannot be the same.");
      }
    }
  
    static validateFutureDate(date: string, errorMessage: string): void {
      const today = new Date();
      const providedDate = new Date(date);
      if (!date || providedDate <= today) {
        throw (errorMessage || "Date should be a future date.");
      }
    }

    static validateReturnDate(deptdate: string, return_date:string, errorMessage: string): void {
      const deptDate = new Date(deptdate);
      const returnDate = new Date(return_date);
      if (returnDate <= deptDate) {
        throw (errorMessage || "Date should not be a greater than return date.");
      }
    }
  
    static validateCabinClass(cabinClass: string): void {
      if (!cabinClass) {
        throw ("Kindly choose a cabin class.");
      }
    }
  }
  