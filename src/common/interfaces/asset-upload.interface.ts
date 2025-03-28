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
        mimetype: string;
        url: string;
        metadata?: Record<string, unknown>;
    };
}

export type AssetMetadata = {
    original_name: string;
    size: number;
    mimetype: string;
    uploaded_at: Date;
    last_modified?: Date;
    user_id: string | number;
    metadata?: Record<string, unknown> | string;
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
        mimetype: string;
        url: string;
        metadata?: Record<string, unknown> | string;
        uploadedAt: Date;
        lastModified?: Date;
    };
}