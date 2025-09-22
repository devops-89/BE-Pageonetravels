import { Body, Controller, Get, Post, Query, Res, Req, UploadedFiles, UseInterceptors, Param } from '@nestjs/common';
import { PackageService } from './package.services';
import { CreatePackageCategoryDto, UpdatePackageCategoryDto } from '../../../../libs/dtos/package/package-category.dto';
import { CreatePackageAmeniteDto, UpdatePackageAmeniteDto, AmeniteIdParams } from '../../../../libs/dtos/package/package-amenites.dto';
import { CreatePackageDayDto, PkgIdParams, UpdatePackageDayDto } from '../../../../libs/dtos/package/package-days.dto';
import { CreatePackageDto, PkgId } from '../../../../libs/dtos/package/package-create.dto';
import { CancelPackageBookingDto } from '../../../../libs/dtos/package/package-booking.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../libs/utils/fileUpload';
import { PaginationDto } from '../../../../libs/dtos/authentication/user.dto';
import { PackageFilterDto } from '../../../../libs/dtos/package/package.dto';

@Controller('package')
export class PackageController {
    constructor(private readonly packageService: PackageService, private readonly responseHandlerService: ResponseHandlerService) {}

    @Get('pkglistdata')
    async getPkgListData(@Res() res: Response) {
        try {
            const result = await this.packageService.getPkgListData();
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Error in find Pkd All List', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('create')
    @UseInterceptors(
        FileFieldsInterceptor(
            [
                { name: 'main_image', maxCount: 1 },
                { name: 'gallery_image', maxCount: 3 },
                { name: 'banner_image', maxCount: 1 },
            ],
            {
                fileFilter: imageFileFilter,
                limits: { fileSize: 5 * 1024 * 1024 },
            }
        )
    )
    async addPackage(@Res() res: Response, @Req() req: Request, @Body() body: CreatePackageDto, @UploadedFiles() files) {
        try {
            const mainImageFile = files?.main_image?.[0];
            const bannerImageFile = files?.banner_image?.[0];
            const galleryImageFiles = files?.gallery_image || [];

            const result = await this.packageService.createPackage(body, mainImageFile, bannerImageFile, galleryImageFiles);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Create Package Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Get('list')
    async getPackageList(@Query() pagination: PaginationDto, @Query() filters: PackageFilterDto, @Res() res: Response) {
        try {
            const result = await this.packageService.getPackage(pagination, filters);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Get Package List Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('update')
    async updatePackage(@Res() res: Response, @Query() id: PkgId, @Req() req: Request, @Body() body: any) {
        try {
            const result = await this.packageService.pkgUpdate(id.id, body);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Update Package Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('delete')
    async deletePackage(@Res() res: Response, @Req() req: Request, @Body() body: any) {
        try {
            console.log('Delete Package', body);
        } catch (error) {
            console.log('Delete Package Error', error);
        }
    }

    // category
    @Post('category/add')
    @UseInterceptors(
        FileFieldsInterceptor([{ name: 'category_image', maxCount: 1 }], {
            fileFilter: imageFileFilter,
            limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
        })
    )
    async addCategory(@Res() res: Response, @Req() req: Request, @UploadedFiles() files, @Body() body: CreatePackageCategoryDto) {
        try {
            const imageFile = files?.category_image?.[0];

            const result = await this.packageService.addCategory(body, imageFile);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Add Category Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Get('category/getAll')
    async getAllPkgCategory(@Res() res: Response) {
        try {
            const result = await this.packageService.getAllCategory();
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Get All Category Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('category/update')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'category_image', maxCount: 1 }], { fileFilter: imageFileFilter }))
    async updatePkgCategory(@Res() res: Response, @Req() req: Request, @Query('id') id: string, @UploadedFiles() files, @Body() body: UpdatePackageCategoryDto) {
        try {
            const imageFile = files?.category_image?.[0]; // ✅ Get file if present
            const result = await this.packageService.updateCategory(id, body, imageFile); // ✅ Pass it to service
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Update Category Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    // Amenite -Add
    @Post('amenities/add')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'amenite_image', maxCount: 1 }], { fileFilter: imageFileFilter, limits: { fileSize: 2 * 1024 * 1024 } }))
    async addPkgAmenities(@Res() res: Response, @Req() req: Request, @Body() body: CreatePackageAmeniteDto, @UploadedFiles() files) {
        try {
            // console.log(">>>>>>> amenite >",files);
            const imageFile = files?.amenite_image?.[0];
            const result = await this.packageService.addAmenites(body, imageFile);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Add Pkg Amenities Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    // Amenite -Get
    @Get('amenities/getAll')
    async getPkgAmenites(@Res() res: Response) {
        try {
            const result = await this.packageService.getAmenites();
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Add Pkg Amenites Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    // Amenite -Update
    @Post('amenities/update')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'amenite_image', maxCount: 1 }], { fileFilter: imageFileFilter }))
    async updatePkgAmenites(@Res() res: Response, @Req() req: Request, @UploadedFiles() files, @Query() query: AmeniteIdParams, @Body() body: UpdatePackageAmeniteDto) {
        try {
            const result = await this.packageService.updateAmenites(query.amenite_id, body);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Update Pkg Error.', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    // pkg day's

    @Post('pkgday/add')
    async addPkgday(@Res() res: Response, @Req() req: Request, @Body() body: CreatePackageDayDto) {
        try {
            const result = await this.packageService.addPkgDay(body);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Add pkg Day Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Get('pkgday/list')
    async getPkgdaylist(@Res() res: Response) {
        try {
            const result = await this.packageService.getPkgDayList();
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Get pkg Day List Error', error);
            throw error;
        }
    }

    @Post('pkgday/update')
    async updatePkgday(@Req() req: Request, @Res() res: Response, @Query() query: PkgIdParams, @Body() body: UpdatePackageDayDto) {
        try {
            const result = await this.packageService.updatePkgDay(query.pkgday_id, body);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Update Pkg Day Error', error);
            throw error;
        }
    }

    @Get('details/:id')
    async getPackageDetailsById(@Res() res: Response, @Param('id') id: string) {
        try {
            const result = await this.packageService.getPackageById(id);
            return this.responseHandlerService.sendSuccessResponse(res, result);
        } catch (error) {
            console.log('Get Package Details By ID Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }

    @Post('cancel_package_booking')
    async cancelPackageBooking(@Res() res: Response, @Body() body: CancelPackageBookingDto) {
        try {
            const result = await this.packageService.cancelPackageBooking(body);

            return this.responseHandlerService.sendSuccessResponse(res, {
                message: 'Package booking cancelled successfully',
                data: result,
            });
        } catch (error) {
            console.log('Cancel Package Booking Error', error);
            return this.responseHandlerService.sendErrorResponse(res, error);
        }
    }
}
