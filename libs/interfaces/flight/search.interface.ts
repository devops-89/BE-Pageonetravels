export interface IFlightSearch{
    journey_type:string,
    origin:string,
    destination:string,
    journey_date:Date,
    adult:number,
    child: number,
    infant: number,
    direct_flight: boolean,
    one_stop_flight: boolean,
    cabin_class: number
}
 
export interface CabinClass {
    ALL: 1,
    ECONOMY:2,
    PREMIUM_ECONOMY:3,
    BUSINESS:4,
    PREMIUM_BUSINESS:5,
    FIRST_CLASS : 6,
}

export interface JourneyType {
    ONE_WAY:1,
    RETURN : 2,
    MULTI_STOP: 3,
    ADVANCE_SEARCH: 4,
    SPECIAL_RETURN:5
}