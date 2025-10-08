import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HotelTboCode } from "../entities";
import { HotelCity } from "../entities";

@Injectable()
export class HotelTboCodeRepositoryService {
  constructor(
    @InjectRepository(HotelTboCode)
    private readonly hotelTboCodeRepository: Repository<HotelTboCode>,
  ) {}

  /**
   * Save or update hotel codes for a city
   */
async saveOrUpdateHotelCodes(city: Partial<HotelCity>, hotels: any[]): Promise<void> {
  if (!hotels?.length) {
    console.warn(`⚠️ No hotels to save for ${city.city_name} (${city.city_code})`);
    return;
  }

  // Normalize country code
  const countryCode = city.country_code?.toUpperCase();

  // Get all unique city names from hotels + city object
  const hotelCityNames = hotels
    .map(h => h.CityName?.trim())
    .filter(Boolean);
  const allCityNames = [...new Set([city.city_name?.trim(), ...hotelCityNames])];
  const cityNameCombined = allCityNames.join(', ');

  // Get all unique hotel codes
  const hotelCodes = [...new Set(hotels.map(h => h.HotelCode).filter(Boolean))].join(',');

  const existing = await this.hotelTboCodeRepository.findOne({
    where: { city_code: city.city_code },
  });

  if (existing) {
    // Update
    existing.hotel_codes = hotelCodes;
    existing.city_name = cityNameCombined;
    existing.country_code = countryCode;
    existing.country_name = city.country_name;
    await this.hotelTboCodeRepository.save(existing);

    console.log(
      `🔄 Updated hotel codes for city_code: ${city.city_code} with ${hotels.length} hotels`
    );
  } else {
    // Insert
    const newEntry = this.hotelTboCodeRepository.create({
      city_code: city.city_code,
      city_name: cityNameCombined,
      country_code: countryCode,
      country_name: city.country_name,
      hotel_codes: hotelCodes,
    });

    await this.hotelTboCodeRepository.save(newEntry);

    console.log(
      `✅ Inserted hotel codes for city_code: ${city.city_code} with ${hotels.length} hotels`
    );
  }

  
}

  async countHotelsByCity(city_code: string): Promise<number> {
    return this.hotelTboCodeRepository.count({ where: { city_code } });
  }
}

