export interface AssetUploadRequest {
    file: Express.Multer.File;
    metadata?: Record<string, unknown>;
}

export interface AssetUploadResponse {
    success: boolean;
    message: string;
    data?: {
        fileId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        metadata?: Record<string, unknown>;
    };
}

export type AssetMetadata = {
    originalName: string;
    size: number;
    mimeType: string;
    uploadedAt: Date;
    lastModified?: Date;
    metadata?: Record<string, unknown>;
}

export type GetFileByIdParams = {
    fileId: string;
}

export interface GetFileByIdResponse {
    success: boolean;
    message: string;
    data?: {
        fileId: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        metadata?: Record<string, unknown>;
        uploadedAt: Date;
        lastModified?: Date;
    };
}