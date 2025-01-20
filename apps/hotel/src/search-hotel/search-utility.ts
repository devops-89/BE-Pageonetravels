export class HotelValidator {
    static validateLocation(location: string) {
      if (!location || location.length < 3) {
        throw new Error("Location must be a valid city or area name");
      }
    }
  
    static validateDates(check_in: string, check_out: string) {
      const today = new Date();
      const checkInDate = new Date(check_in);
      const checkOutDate = new Date(check_out);
  
      if (checkInDate <= today) {
        throw new Error("Check-in date must be a future date");
      }
  
      if (checkOutDate <= checkInDate) {
        throw new Error("Check-out date must be after check-in date");
      }
    }
  }