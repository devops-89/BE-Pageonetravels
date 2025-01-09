import { IsString, IsInt, IsArray, IsOptional, IsNumberString } from 'class-validator';

export class HotelSearchDto {
  @IsString()
  check_in_date: string; 

  @IsString()
  check_out_date: string; 

  @IsInt()
  adult_count: number;

  @IsInt()
  child_count: number;

  @IsString()
  ip_address: string;

  @IsString()
  city: string;

  @IsString()
  country_code: string;

  @IsString()
  preferred_currency: string;

  @IsString()
  guest_nationality: string; 

  @IsArray()
  room_guests: Array<{
    no_of_adults: number;
    no_of_children: number;
    child_ages: number[] | null; 
  }>;

  @IsOptional()
  @IsInt()
  max_rating?: number;

  @IsOptional()
  @IsInt()
  min_rating?: number;

  @IsOptional()
  @IsNumberString()
  result_count?: string | null;

  @IsString()
  token_id: string; // The token for API authentication
}


// import { IsString, IsInt, IsDateString, IsArray, IsOptional } from 'class-validator';

// export class HotelSearchDto {
//   @IsString()
//   check_in_date: string;

//   @IsString()
//   check_out_date: string; 

//   @IsInt()
//   adult_count: number;

//   @IsInt()
//   child_count: number;

//   @IsString()
//   ip_address: string;

//   @IsString()
//   city: string;

//   @IsString()
//   country_code: string;

//   @IsString()
//   preferred_currency: string;

//   @IsString()
//   guest_nationality: string;

//   @IsArray()
//   room_guests: Array<{
//     NoOfAdults: number;
//     NoOfChild: number;
//     ChildAge: number[];
//   }>;

//   @IsOptional()
//   @IsInt()
//   max_rating?: number;

//   @IsOptional()
//   @IsInt()
//   min_rating?: number;
// }


// import { IsString, IsInt, Min, Max, IsOptional, IsNumber } from 'class-validator';

// export class HotelSearchDto {
//   @IsString()
//   location: string;

//   @IsString()
//   check_in_date: string;

//   @IsString()
//   check_out_date: string;

//   @IsInt()
//   @Min(1)
//   guests: number;

//   @IsInt()
//   @Min(1)
//   @Max(5)
//   rooms: number;

//   @IsOptional()
//   @IsString()
//   city: string;

//   @IsString()
//   ip_address: string;

//   @IsOptional()
//   @IsNumber()
//   adult_count:number;

//   @IsOptional()
//   @IsNumber()
//   child_count:number;


// }

// // export class BlockRoomDto {
// //   tokenId: string;
// //   traceId: string;
// //   roomIndices: number[]; // Room indices as per "Fixed" or "Open" combination
// //   isVoucherBooking: boolean; // True or false
// //   paxDetails: PaxDetails[];
// // }
