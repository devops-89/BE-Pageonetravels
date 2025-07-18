import { Injectable } from '@nestjs/common';
// Importing the shared config service to access environment variables
import { ConfigService } from '../config/config.service';
// AWS SDK for interacting with Amazon S3
import { S3 } from 'aws-sdk';

@Injectable() // Marks this class as a provider that can be injected elsewhere
export class S3FileService {
  constructor(private readonly configService: ConfigService) {} // Injects the ConfigService

  /**
   * Upload a single file buffer to S3 with a unique timestamped filename
   * @param dataBuffer - The file buffer (binary content)
   * @param s3FilePath - Desired S3 path or filename
   * @returns Uploaded file's URL from S3
   */
  async s3FileUpload(dataBuffer: Buffer, s3FilePath: string): Promise<string> {
    try {
      const s3 = new S3(); // Create a new S3 client instance

      // Generate a unique filename by appending a timestamp to the original file name
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
      const uniqueFileName = `${timestamp}-${s3FilePath}`;

      // Upload the file to S3 with the specified bucket, content, and key (file name)
      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get().S3_bucket.bucket_name, // Bucket name from config
          Body: dataBuffer, // Actual file content
          Key: uniqueFileName, // S3 path / file name
        })
        .promise(); // Convert AWS callback-style to Promise

      return uploadResult.Location; // Return the S3 public URL of the uploaded file
    } catch (error) {
      console.error('Error in S3 upload function:', error);
      throw error;
    }
  }

  /**
   * Generate a full S3 URL manually if you just know the file name
   * @param fileName - The name of the file in S3
   * @returns The full S3 URL string
   */
  getS3Path(fileName: string): string {
    const s3Config = this.configService.get().S3_bucket;
    return `https://${s3Config.bucket_name}.s3.${s3Config.region}.amazonaws.com/${fileName}`;
  }

  /**
   * Upload multiple files to S3
   * @param files - An array of file objects each with originalname and buffer
   * @param folderPath - A folder prefix to organize files in S3
   * @returns Array of public URLs of uploaded files
   */
  async s3MultipleFileUpload(
    files: { originalname: string; buffer: Buffer }[], // Input type with file name and buffer
    folderPath: string // Folder prefix/path where files will be uploaded
  ): Promise<string[]> {
    try {
      // Create an array of promises to upload all files
      const uploadPromises = files.map(file => {
        const s3FilePath = `${folderPath}/${file.originalname}`; // Example: 'hotels/image.jpg'
        return this.s3FileUpload(file.buffer, s3FilePath); // Reuse single file upload method
      });

      const uploadResults = await Promise.all(uploadPromises); // Wait for all uploads to complete
      return uploadResults; // Return array of uploaded file URLs
    } catch (error) {
      console.error('Error in multiple S3 file upload:', error);
      throw error;
    }
  }
}
