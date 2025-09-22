import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepositoryService } from '../../../../libs/database/src';
import { CreatePackageCategoryDto, UpdatePackageCategoryDto } from '../../../../libs/dtos/package/package-category.dto';
import { PackageCategoryRepositoryService } from '../../../../libs/database/src/repositories/packagecategory.repository';
import { PackageAmeniteRepositoryService } from '../../../../libs/database/src/repositories/packageamenite.repository';
import { PackageDayRepositoryService } from '../../../../libs/database/src/repositories/packageday.repository';
import { PackageRepositoryService } from '../../../../libs/database/src/repositories/package.repository';
import { CreatePackageAmeniteDto, UpdatePackageAmeniteDto } from '../../../../libs/dtos/package/package-amenites.dto';
import { CreatePackageDayDto, UpdatePackageDayDto } from '../../../../libs/dtos/package/package-days.dto';
import {CancelPackageBookingDto} from "../../../../libs/dtos/package/package-booking.dto";
import { PackageBookingRepositoryService } from '../../../../libs/database/src';
import { PaginationDto } from '../../../../libs/dtos/authentication/user.dto';

import { S3FileService } from '../../../../libs/S3-Service/s3File.service';
import { PackageFilterDto } from '../../../../libs/dtos/package/package.dto';


@Injectable()
export class PackageService {
    constructor(
        private readonly UserModel: UserRepositoryService,
        private readonly packageDayRepositoryService: PackageDayRepositoryService,
        private readonly packageRepositoryService: PackageRepositoryService,
        private readonly packageCategoryRepositoryService: PackageCategoryRepositoryService,
        private readonly packageAmeniteRepositoryService: PackageAmeniteRepositoryService,
        private readonly packageBookingRepositoryService: PackageBookingRepositoryService,
        private readonly s3FileService: S3FileService
    ) {}

    // get Data list Package
    async getPkgListData() {
        try {
            const totalAmenites = await this.packageAmeniteRepositoryService.getAllAmenites();
            const totalCateogry = await this.packageCategoryRepositoryService.getAllCategory();
            const totalDays = await this.packageDayRepositoryService.getDayFetch();
            const data = {
                amenites: totalAmenites,
                category: totalCateogry,
                days: totalDays,
            };

            return {
                message: `All Package Days, Amenites, Category`,
                data: data,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    // Create Package

    async createPackage(body, mainImageFile, bannerImageFile, galleryImageFile) {
        try {
            // Upload main Images
            if (mainImageFile) {
                const mainPath = `packages/main/${Date.now()}-${mainImageFile.originalname}`;
                const s3path = await this.s3FileService.s3FileUpload(mainImageFile.buffer, mainPath);
                console.log("main image:",s3path);
                body.main_image = s3path;
            }

            // Upload banner Images
            if (bannerImageFile) {
                const bannerPath = `packages/banner/${Date.now()}-${bannerImageFile.originalname}`;
                const s3path = await this.s3FileService.s3FileUpload(bannerImageFile.buffer, bannerPath);
                console.log("banner image:",s3path);
                body.banner_image = s3path;
            }

            // Upload Gallery Image
            if (galleryImageFile) {
                const galleryImageUrls = await Promise.all(
                    galleryImageFile.map((file) => {
                        const filePath = `packages/gallery/${Date.now()}-${file.originalname}`;
                        return this.s3FileService.s3FileUpload(file.buffer, filePath); // ✅ use file.buffer
                    })
                );
                console.log("gallery image:",galleryImageUrls);
                body.gallery_image = galleryImageUrls; // ✅ correctly set array of URLs
            }


            console.log('body Data: ', body);

            // now insert in the database the url string
            const result = await this.packageRepositoryService.insertPackage(body);
            return { message: `Package Created Successfully.`, data: result };
        } catch (error) {
            console.log('Create Package Service Error...', error);
            throw error;
        }
    }

    // Get Package List
   async getPackage(page: PaginationDto, filters: PackageFilterDto) {
  try {
    const result = await this.packageRepositoryService.getPackageList(page, filters);
    return {
      message: "Package list fetched successfully.",
      data: result,
    };
  } catch (error) {
    console.log('Package list service error', error);
    throw error;
  }
}

    async pkgUpdate(id, body: any) {
        try {
            const result = await this.packageRepositoryService.getPackageUpdate(id, body);
            return { message: `Package Updated Successfully.`, data: result };
        } catch (error) {
            console.log('Package Update Service Error...', error);
            throw error;
        }
    }

    // add-category
    async addCategory(input: CreatePackageCategoryDto, file?) {
        try {
            if (file) {
                const filePath = `categories/${Date.now()}-${file.originalname}`;
                const s3Url = await this.s3FileService.s3FileUpload(file.buffer, filePath);
                input.category_image = s3Url;
            }
            const result = await this.packageCategoryRepositoryService.insertCategory(input);
            return { message: `Package Category Created Successfully`, data: result };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAllCategory() {
        try {
            const result = await this.packageCategoryRepositoryService.getAllCategory();
            console.log('>>>>>>>>>>> >', result);
            return { message: `Package Category fetch Successfully.`, data: result };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateCategory(id: string, body: UpdatePackageCategoryDto, file?) {
        try {
            if (file) {
                const filePath = `categories/${Date.now()}-${file.originalname}`;
                const s3Url = await this.s3FileService.s3FileUpload(file.buffer, filePath);
                body.category_image = s3Url; // ✅ Replace old image with new S3 URL
            }

            const result = await this.packageCategoryRepositoryService.updateCategory(id, body);
            return { message: `Package Category Updated Successfully.`, data: result };
        } catch (error) {
            console.log('Update Category Service Error:', error);
            throw error;
        }
    }

    // Amenites
    async addAmenites(body: CreatePackageAmeniteDto, file?) {
        try {
            if (file) {
                const filePath = `amenities/${Date.now()}-${file.originalname}`;
                const s3Url = await this.s3FileService.s3FileUpload(file.buffer, filePath);
                body.amenite_image = s3Url;
            }
            const result = await this.packageAmeniteRepositoryService.insetAmenites(body);
            return { message: `Package Amenites Created Successfully`, data: result };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getAmenites() {
        try {
            const result = await this.packageAmeniteRepositoryService.getAllAmenites();
            console.log('>>>>>>>>>>> >', result);
            return { message: `Package Amenites fetch Successfully.`, data: result };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateAmenites(amenite_id, body: UpdatePackageAmeniteDto) {
        try {
            const result = await this.packageAmeniteRepositoryService.updateAmenites(amenite_id, body);
            return { message: `Package Amenites Updated Successfully.`, data: result };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async addPkgDay(body: CreatePackageDayDto) {
        try {
            const result = await this.packageDayRepositoryService.insetDay(body);
            return { message: `Package Day's Created Successfully`, data: result };
        } catch (error) {
            console.log("Package Day's Error.", error);
            throw error;
        }
    }

    async getPkgDayList() {
        try {
            const result = await this.packageDayRepositoryService.getDayFetch();
            return { message: `Package Day's fetch Successfully.`, data: result };
        } catch (error) {
            console.log('Error in package days list', error);
            throw error;
        }
    }

    async updatePkgDay(pkgdayId: string, body: UpdatePackageDayDto) {
        try {
            const result = await this.packageDayRepositoryService.updatePkgday(pkgdayId, body);
            return { message: `Package Day's Updated Successfully.`, data: result };
        } catch (error) {
            console.log("Package Day's Update service Error.", error);
            throw error;
        }
    }

    async getPackageById(id: string) {
        try {
            const result = await this.packageRepositoryService.getPackageById(id);
            return { message: `Package details fetched successfully.`, data: result };
        } catch (error) {
            console.log('Get Package By ID Service Error.', error);
            throw error;
        }
    }

    // package booking service
//     async PackageBooking(bookingDto: CreatePackageBookingDto) {
//   try {
//     const pkg = await this.packageRepositoryService.getPackageById(bookingDto.packageId);
//     if (!pkg) {
//       throw new NotFoundException('Package not found');
//     }
//     const bookingData = {
//       package: pkg,
//       title: bookingDto.title,
//       first_name: bookingDto.first_name,
//       last_name: bookingDto.last_name,
//       DOB: bookingDto.DOB,
//       passport_number: bookingDto.passport_number,
//       passport_expiry: bookingDto.passport_expiry,
//       email: bookingDto.email,
//       mealType: bookingDto.mealType,
//     };
//     const booking = await this.packageBookingRepositoryService.createPackageBooking(bookingData);
//     return {
//       message: 'Package booked successfully.',
//       data: booking,
//     };
//   } catch (error) {
//     console.log('Book Package Service Error', error);
//     throw error;
//   }
// }



  /**
   * Cancel a booking by ID
   */
  async cancelPackageBooking(body:CancelPackageBookingDto) {
    try {
      const booking =
        await this.packageBookingRepositoryService.cancelPackageBooking(body);

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      return {
        message: 'Booking cancelled successfully.',
        data: booking,
      };
    } catch (error) {
      console.log('Cancel Booking Service Error', error);
      throw error;
    }
  }

  /**
   * Find bookings by user ID
   */
  // async getUserBookings(userId: string) {
  //   try {
  //     const bookings =
  //       await this.packageBookingRepositoryService.findBookingsByUser(userId);

  //     return {
  //       message: 'User bookings fetched successfully.',
  //       data: bookings,
  //     };
  //   } catch (error) {
  //     console.log('Get User Bookings Service Error', error);
  //     throw error;
  //   }
  // }
}




