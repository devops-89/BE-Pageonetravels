import { Injectable } from '@nestjs/common';
// Importing the shared config service to access environment variables
import { ConfigService } from '../config/config.service';
// AWS SDK for interacting with Amazon S3
import { S3 } from 'aws-sdk';
import { Readable } from 'stream';
import axios from 'axios';
import FormData from "form-data";


type VideoMulterFile = {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;


}

// Helper function
const extractFileUrls = (responseData: any, baseURL: string): string[] => {
    try {
        console.log('🔍 Full API Response:', JSON.stringify(responseData, null, 2));

        let uploadedPaths: any[] = [];

        if (Array.isArray(responseData?.data?.uploaded)) {
            uploadedPaths = responseData.data.uploaded;
        } else if (Array.isArray(responseData?.data?.filePath?.uploaded)) {
            uploadedPaths = responseData.data.filePath.uploaded;
        } else if (Array.isArray(responseData?.data?.filePath)) {
            uploadedPaths = responseData.data.filePath;
        } else {
            console.warn('⚠️ Unexpected response:', responseData);
            return [];
        }

        return uploadedPaths
            .map((item: any) => {
                if (typeof item === 'string') {
                    return item.startsWith('http') ? item : `${baseURL}/${item.replace(/^\/+/, '')}`;
                } else if (item?.url) {
                    return item.url.startsWith('http') ? item.url : `${baseURL}/${item.url.replace(/^\/+/, '')}`;
                } else if (item?.path) {
                    return `${baseURL}/${item.path.replace(/^\/+/, '')}`;
                } else {
                    return '';
                }
            })
            .filter(Boolean);
    } catch (err) {
        console.error('❌ Failed to parse responseData:', err);
        return [];
    }
};

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

    // this is the function for external function required for local storage
    async uploadImagesAndVideosToExternalAPI (files: VideoMulterFile[]): Promise<string[]>  {
        const uploadUrl = process.env.UPLOAD_IMAGE_VIDEO_URL!;
        const baseURL = process.env.UPLOAD_BASE_URL!;
        const headers = {
            companyId: 'D3A17C9B-52EF-4F89-9A12-6B8F4F0C92AB', // ✅ required by your document-service
        };

        try {
            if (!files || files.length === 0) {
                console.warn('⚠️ No files to upload');
                return [];
            }

            const finalUrls: string[] = [];

            for (const file of files) {
                console.log(`📤 Uploading: ${file.originalname}`);

                // ✅ Convert buffer to stream (required for Busboy)
                const stream = Readable.from(file.buffer);

                const formData = new FormData();
                formData.append('files[]', stream, {
                    filename: file.originalname,
                    contentType: file.mimetype,
                });

                // Extra metadata fields
                formData.append('name', 'Himanshu');
                formData.append('phoneNumber', '9999999999');
                formData.append('email', 'test@example.com');

                const response = await axios.post(uploadUrl, formData, {
                    headers: {
                        ...headers,
                        ...formData.getHeaders(),
                    },
                    timeout: 180000, // ⏳ 3-minute timeout for big files
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                });

                const urls = extractFileUrls(response.data, baseURL);
                finalUrls.push(...urls);
            }

            console.log('✅ All uploaded file URLs:', finalUrls);
            return finalUrls;
        } catch (error: any) {
            console.error('❌ External file upload failed:', error.response?.data || error.message);
            throw {
                message: error.response?.data?.message || error.message || 'External file upload failed',
                statusCode: error.response?.status || 500,
            };
        }
    };


}
