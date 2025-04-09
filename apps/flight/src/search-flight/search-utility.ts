import { ERROR_CODES } from "../../../../libs/constants/commonConstants";

export class FlightValidator {
    static validateOriginDestination(origin: string, destination: string): void {
      if (!origin || !destination) {
        // throw ("Origin and destination are required.");
        throw { message: "Origin and destination are required.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
      if (origin === destination) {
        // throw ("Origin and destination cannot be the same.");
        throw { message: "Origin and destination cannot be the same.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
    }
  
    static validateFutureDate(date: string, errorMessage: string): void {
      const today = new Date();
      const providedDate = new Date(date);
      if (!date || providedDate <= today) {
        // throw (errorMessage || "Date should be a future date."); 
        throw { message: "Date should be a future date.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
    }

    static validateReturnDate(deptdate: string, return_date:string, errorMessage: string): void {
      const deptDate = new Date(deptdate);
      const returnDate = new Date(return_date);
      if (returnDate <= deptDate) {
        // throw (errorMessage || "Date should not be a greater than return date.");
        throw { message: "Date should not be a greater than return date.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
    }
  
    static validateCabinClass(cabinClass: string): void {
      if (!cabinClass) {
        // throw ("Kindly choose a cabin class.");
        throw { message: "Kindly choose a cabin class.", statusCode: ERROR_CODES.BAD_REQUEST };
      }
    }
  }
  