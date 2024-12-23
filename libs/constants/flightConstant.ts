export enum JOURNEY_TYPE {
    ONEWAY = 1,
    ROUNDTRIP = 2,
    MULTICITY =3,
    ADVANCE= 4,
    SPECIALRETURN =5
}

export enum TimeFilter {
    "AnyTime" = '00:00:00',
    "Morning" = '08:00:00',
    "AfterNoon" = '14:00:00',
    "Evening" = '19:00:00',
    "Night" = '01:00:00'
  }