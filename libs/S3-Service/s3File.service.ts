import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3FileService {
    constructor(private readonly configService: ConfigService) { }

    async s3FileUpload(dataBuffer: Buffer, s3FilePath: string) {
        try {
            const s3 = new S3();
            // Get the current timestamp (formatted)
            const timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Formats the date to YYYYMMDD

            // Create a unique file name using the original file name and the timestamp
            const uniqueFileName = `${timestamp}-${s3FilePath}`;

            const uploadResult = await s3
                .upload({
                    Bucket: this.configService.get().S3_bucket.bucket_name,
                    Body: dataBuffer,
                    Key: uniqueFileName,
                })
                .promise();

            return uploadResult.Location;
        } catch (Error) {
            console.log('Error in s3 Upload function', Error);
        }
    }

    getS3Path(fileName: string) {
        const s3Config = this.configService.get().S3_bucket;
        return `https://${s3Config.bucket_name}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
    }

    async s3MultipleFileUpload(files, folderPath: string): Promise<string[]> {
        try {
            const uploadPromises = files.map(file => {
                const s3FilePath = `${folderPath}/${file.originalname}`;
                return this.s3FileUpload(file.buffer, s3FilePath);
            });

            const uploadResults = await Promise.all(uploadPromises);
            return uploadResults;
        } catch (error) {
            console.error('Error in multiple S3 file upload', error);
            throw error;
        }
    }
}