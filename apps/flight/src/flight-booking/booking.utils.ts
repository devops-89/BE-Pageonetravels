export class BookingValidatior{

    static checkTodayDateValidation(dob){
        const today_date = new Date();
        const date_of_birth = new Date(dob);
    
        if(today_date < date_of_birth ){
            throw "Date of Birth should be less than today date";
        }
    }


    static childAgeValidation(dob){
        const date_of_birth = new Date(dob);
        const today = new Date();
        const diff = today - date_of_birth.getTime();
        const diff_ms = new Date(diff);
        const age = Math.abs(diff_ms.getUTCFullYear() - 1970);
        console.log(age);

        if(age > 12){
            throw "Child Age is less than 12 years";
        }
 
    }

    // static AdultAgeValidation(dob){
    //     //
    //     const today_date = new Date();
    //     const date_of_birth = new Date(dob);
    
    //     //today and dateof birth 

    //     //age = dob -today date 
    //     if(age > 12){
    //         throw "Child Age is less than 12";
    //     }
    // }

    static InfantAgeValidation(dob:Date){
        const date_of_birth = new Date(dob);
        const today = new Date();
        const diff = today - date_of_birth.getTime();
        const diff_ms = new Date(diff);
        const age = Math.abs(diff_ms.getUTCFullYear() - 1970);
        console.log(age);

        if(age > 2){
            throw "Infant Age is less than 2 Years";
        }
    }

}
