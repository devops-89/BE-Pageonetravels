export enum JOURNEY_TYPE {
    ONEWAY = 1,
    ROUNDTRIP = 2,
    MULTICITY = 3,
    ADVANCE = 4,
    SPECIALRETURN = 5,
  }

  export enum JOURNEYTYPEMAPPING {
    ONEWAY = 'ONEWAY',
    ROUNDTRIP = 'ROUNDTRIP',
    MULTICITY = 'MULTICITY',
    ADVANCE = 'ADVANCE',
    SPECIALRETURN = 'SPECIALRETURN',
  }
  
  export enum JOURNEYTYPE{
    ONEWAY = 'ONEWAY',
    ROUNDTRIP = 'ROUNDTRIP',
    MULTICITY = 'MULTICITY'
  }
  export enum JOURNEY{
    DOMESTIC = "DOMESTIC",
    INTERNATIONAL = "INTERNATIONAL"
  }

  export enum TimeFilter {
    AnyTime = 'AnyTime',
    Morning = 'Morning',
    AfterNoon = 'AfterNoon',
    Evening = 'Evening',
    Night = 'Night',
}