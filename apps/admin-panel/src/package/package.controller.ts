import { Body, Controller, Get, Param, Post, Query, Req, Res, UploadedFiles, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { PackageService } from "./package.services";
import { CreatePackageCategoryDto,UpdatePackageCategoryDto } from '../../../../libs/dtos/package/package-category.dto';
import { CreatePackageAmeniteDto , UpdatePackageAmeniteDto ,AmeniteIdParams } from '../../../../libs/dtos/package/package-amenites.dto';
import { CreatePackageDayDto, PkgIdParams ,UpdatePackageDayDto } from '../../../../libs/dtos/package/package-days.dto';
import { CreatePackageDto } from '../../../../libs/dtos/package/package-create.dto';
import { ResponseHandlerService } from '../../../../libs/response-handler/response-handler.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { imageFileFilter } from '../../../../libs/utils/fileUpload';


@Controller('package')
export class PackageController {
    constructor(
        private readonly packageService: PackageService,
        private readonly responseHandlerService: ResponseHandlerService
    ){}


    @Post('create')
    async addPackage(@Res() res:Response,@Req() req:Request,@Body() body:CreatePackageDto)
    {
        try{
            const result = await this.packageService.createPackage(body);
            // return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Create Package Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    } 

    @Get('list')
    async getPackageList(@Res() res:Response,@Req() req:Request){
        try{
            console.log("Package List");
        }catch(error){
            console.log("Get Package List Error",error);
        }
    }
    
    
    @Post('update')
    async updatePackage(@Res() res:Response,@Req() req:Request,@Body() body:any)
    {
        try{
            console.log("Update Package",body);
        }catch(error){
            console.log("Update Package Error",error);
        }
    }    


    @Post('delete')
    async deletePackage(@Res() res:Response,@Req() req:Request,@Body() body:any)
    {
        try{
            console.log("Delete Package",body);
        }catch(error){
            console.log("Delete Package Error",error);
        }
    }    

    // category 
    @Post('category/add')
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'category_image', maxCount: 1 }
        ],
        { fileFilter: imageFileFilter }
      )
    )
    async addCategory(@Res() res:Response,@Req() req:Request, @UploadedFiles() files,@Body() body:CreatePackageCategoryDto){
        try{
            const result = await this.packageService.addCategory(body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Add Category Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    @Get('category/getAll')
    async getAllPkgCategory(@Res() res:Response,@Req() req:Request){
        try{
            const result = await this.packageService.getAllCategory();
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Get All Category Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    @Post('category/update')
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'category_image', maxCount: 1 }
        ],
        { fileFilter: imageFileFilter }
      )
    ) 
    async updatePkgCategory(@Res() res:Response,@Req() req:Request, @Query('id') id: string,@Body() body:UpdatePackageCategoryDto){
        try{
            const result = await this.packageService.updateCategory(id,body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Update Category Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    // Amenite -Add
    @Post('amenities/add')
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'amenite_image', maxCount: 1 }
        ],
        { fileFilter: imageFileFilter }
      )
    ) 
    async addPkgAmenities(@Res() res:Response,@Req() req:Request,@Body() body:CreatePackageAmeniteDto , @UploadedFiles() files ){
        try{
            const result = await this.packageService.addAmenites(body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Add Pkg Amenities Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    // Amenite -Get
    @Get('amenities/getAll')
    async getPkgAmenites(@Res() res:Response,@Req() req:Request){
        try{
            const result = await this.packageService.getAmenites();
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Add Pkg Amenites Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    // Amenite -Update
    @Post('amenities/update')
    @UseInterceptors(
      FileFieldsInterceptor(
        [
          { name: 'amenite_image', maxCount: 1 }
        ],
        { fileFilter: imageFileFilter }
      )
    ) 
    async updatePkgAmenites(@Res() res:Response,@Req() req:Request,@UploadedFiles() files , @Query() query: AmeniteIdParams,@Body() body:UpdatePackageAmeniteDto){
        try{
            const result = await this.packageService.updateAmenites(query.amenite_id,body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Update Pkg Error.",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    // pkg day's 

    @Post('pkgday/add')
    async addPkgday(@Res() res:Response,@Req() req:Request,@Body() body:CreatePackageDayDto){
        try{
            const result = await this.packageService.addPkgDay(body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Add pkg Day Error",error);
            return this.responseHandlerService.sendErrorResponse(res,error);
        }
    }

    @Get('pkgday/list')
    async getPkgdaylist(@Res() res:Response){
        try{
            const  result = await this.packageService.getPkgDayList();
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Get pkg Day List Error",error);
            throw error;
        }
    }

    @Post('pkgday/update')
    async updatePkgday(@Req() req:Request, @Res() res:Response,@Query() query: PkgIdParams, @Body() body:UpdatePackageDayDto){
        try{
            const result = await this.packageService.updatePkgDay(query.pkgday_id,body);
            return this.responseHandlerService.sendSuccessResponse(res,result);
        }catch(error){
            console.log("Update Pkg Day Error",error);
            throw error;
        }
    }



}