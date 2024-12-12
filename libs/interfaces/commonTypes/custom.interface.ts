export interface IPaginationObject {
    docs: any[],
    totalDocs?: number,
    limit: number,
    page?: number,
    totalPages?: number,
    hasPrevPage?: boolean,
    hasNextPage?: boolean
}

export interface IPagination
{
    page: number,
    pageSize: number
}

export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
