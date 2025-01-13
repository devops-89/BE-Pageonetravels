// export class BookingValidatior{

//     static checkTodayDateValidation(dob){
//         const today_date = new Date();
//         const date_of_birth = new Date(dob);
    
//         if(today_date < date_of_birth ){
//             throw "Date of Birth should be less than today date";
//         }
//     }


//     static childAgeValidation(dob:string | Date){
//         const date_of_birth = new Date(dob);
//         const today = new Date();
//         const diff = today - date_of_birth.getTime();
//         const diff_ms = new Date(diff);
//         const age = Math.abs(diff_ms.getUTCFullYear() - 1970);
//         console.log(age);

//         if(age > 12){
//             throw "Child Age is less than 12 years";
//         }
 
//     }

//     // static AdultAgeValidation(dob){
//     //     //
//     //     const today_date = new Date();
//     //     const date_of_birth = new Date(dob);
    
//     //     //today and dateof birth 

//     //     //age = dob -today date 
//     //     if(age > 12){
//     //         throw "Child Age is less than 12";
//     //     }
//     // }

//     static InfantAgeValidation(dob:Date){
//         const date_of_birth = new Date(dob);
//         const today = new Date();
//         const diff = today - date_of_birth.getTime();
//         const diff_ms = new Date(diff);
//         const age = Math.abs(diff_ms.getUTCFullYear() - 1970);
//         console.log(age);

//         if(age > 2){
//             throw "Infant Age is less than 2 Years";
//         }
//     }

// }
export class BookingValidator {
    // Validate if DOB is in the past
    static checkTodayDateValidation(dob: string | Date) {
        const todayDate = new Date();
        const dateOfBirth = new Date(dob);

        if (dateOfBirth >= todayDate) {
            throw "Date of Birth should be less than today's date.";
        }
    }

    // Validate if age is less than or equal to 12 years (Child)
    static childAgeValidation(dob: string | Date) {
        BookingValidator.checkTodayDateValidation(dob);
        const age = BookingValidator.calculateAge(dob);

        if (age > 12) {
            throw "Child age must be less than or equal to 12 years.";
        }
        return age
    }

    static adultAgeValidation(dob: string | Date) {
        BookingValidator.checkTodayDateValidation(dob);
        const age = BookingValidator.calculateAge(dob);

        if (age < 12) {
            throw "Adult age must be greator than 12 years.";
        }
        return age
    }

    // Validate if age is less than or equal to 2 years (Infant)
    static infantAgeValidation(dob: string | Date) {
        BookingValidator.checkTodayDateValidation(dob);
        const age = BookingValidator.calculateAge(dob);

        if (age > 2) {
            throw "Infant age must be less than or equal to 2 years.";
        }
       
    }

    // Utility method to calculate age
    private static calculateAge(dob: string | Date): number {
        const dateOfBirth = new Date(dob);
        const today = new Date();
        return today.getFullYear() - dateOfBirth.getFullYear() - 
               (today.getMonth() < dateOfBirth.getMonth() ||
                (today.getMonth() === dateOfBirth.getMonth() && today.getDate() < dateOfBirth.getDate()) ? 1 : 0);
    }
    
}
