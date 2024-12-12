import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { FileValidationOptions } from './fileValidationOptions';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { FileUpload } from '../interfaces/commonTypes/custom.interface';

@Injectable()
export class MultipleFilesValidationPipe implements PipeTransform<any> {
  constructor(private readonly options: FileValidationOptions) {}

  async transform(files: {[key:string]:[FileUpload]}) {

    const hasFiles = files && Object.values(files).some(fileArray => fileArray && fileArray.length > 0);

    if (!hasFiles) {
      throw new BadRequestException('No files uploaded');
    }


    const fileTypeRegex = /(jpg|jpeg|png|gif|webp|mp4|avi|mov|mkv|webm)$/;
    const maxSizeInBytes = this.options.maxSize || 10485760; // Default max size: 10MB

    const errors = [];

    for (const fileArray of Object.values(files)) {
        for (const file of fileArray) {
            const isValidType = fileTypeRegex.test(file.originalname.toLowerCase());
            const isWithinSizeLimit = file.size <= maxSizeInBytes;

            if (!isValidType) {
                errors.push(`${file.originalname} has an invalid file type.`);
            }
            if (!isWithinSizeLimit) {
                errors.push(`${file.originalname} exceeds the maximum file size.`);
            }
        }
    }

    if (errors.length > 0) {
      throw new BadRequestException(errors.join(' '));
    }

    return files;
  }
}
