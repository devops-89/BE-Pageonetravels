import { COMMISSION_TYPE } from "libs/constants/autenticationConstants/userContants";
import {JOURNEY, JOURNEYTYPE} from "../constants/flightConstant";

// 🔁 Mapping objects
const journeyTypeMap: Record<number, JOURNEYTYPE> = {
  1: JOURNEYTYPE.ONEWAY,
  2: JOURNEYTYPE.ROUNDTRIP,
  3: JOURNEYTYPE.MULTICITY,
};

const journeyMap: Record<number, JOURNEY> = {
  1: JOURNEY.DOMESTIC,
  2: JOURNEY.INTERNATIONAL,
};

// ✅ Convert API → ENUM
export function mapJourneyType(value: number): JOURNEYTYPE {
  const result = journeyTypeMap[value];
  if (!result) throw new Error("Invalid journey type");
  return result;
}

export function mapJourney(value: number): JOURNEY {
  const result = journeyMap[value];
  if (!result) throw new Error("Invalid journey");
  return result;
}

// ✅ Commission calculator (pure logic)
export function calculateCommission(
  baseFare: number,
  commission: {
    commission_type: "FIXED" | "PERCENTAGE";
    percentage: string;
  }
): number {
  if (!commission) return 0;

  if (commission.commission_type === "FIXED") {
    return parseFloat(commission.percentage);
  }

  if (commission.commission_type === "PERCENTAGE") {
    const percent = parseFloat(commission.percentage);
    return (baseFare * percent) / 100;
  }

  return 0;
}

// export async function getCommission(baseFare,journey_type:JOURNEYTYPE,journey:JOURNEY){
//         const flightType = `FLIGHT_${journey_type}_${journey}` as COMMISSION_TYPE;
//       const commissionType = await this.commissionRepositoryService.getCommissionbytype(flightType);
//         let commission=0;
//         if (commissionType.commission_type === "FIXED") {
//             commission = parseFloat(commissionType.percentage);
//         } else if (commissionType.commission_type === "PERCENTAGE") {
//             const percentValue = parseFloat(commissionType.percentage);
//             commission = (baseFare * percentValue) / 100;
//         }

//         return commission;
//     }