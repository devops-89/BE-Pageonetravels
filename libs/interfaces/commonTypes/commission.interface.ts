import { COMMISSION_TYPE,TYPE_COMMISSION } from "../../../libs/constants/autenticationConstants/userContants"

export interface Icommission{
    type:COMMISSION_TYPE,
    commission_type:TYPE_COMMISSION,
    percentage:string,
    status: boolean
}

export interface Ucommission{
    commission_id: string,
    type:COMMISSION_TYPE,
    commission_type:TYPE_COMMISSION,
    percentage: string,
    status: boolean
}