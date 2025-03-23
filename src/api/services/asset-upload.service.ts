import { Readable } from 'stream';
import { Client } from 'minio';
import { getMinioClient } from 'loader/minio.loader';
import { storageConfig } from 'config/storage.config';
import { AssetMetadata, AssetUploadResponse, GetFileByIdResponse } from 'common/interfaces/asset-upload.interface';
import logger from 'util/logger';
import BadRequest from 'responses/client-errors/bad-request';
import InternalServerError from 'responses/server-errors/internal-server-error';

export default class AssetUploadService {
    private minioClient: Client;
    constructor() { 
        // Private constructor to prevent instantiation
        this.minioClient = getMinioClient();
    }

    /**
     * Upload a file to MinIO storage
     * @param file File to upload
     * @param metadata Optional metadata
     * @returns Upload response with file details
     */
    public async uploadFile(file: Express.Multer.File, metadata?: Record<string, unknown>): Promise<AssetUploadResponse> {
        if (!file) {
            throw new BadRequest('FILE_REQUIRED', 'File is required', 'No file was provided for upload');
        }

        if (!file.buffer || !file.originalname || !file.size || !file.mimetype) {
            throw new BadRequest('INVALID_FILE', 'Invalid file format', 'The provided file is missing required properties');
        }

        try {
            const fileId = this.generateFileId(file.originalname);
            const fileStream = Readable.from(file.buffer);

            const assetMetadata: AssetMetadata = {
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                uploadedAt: new Date(),
                metadata
            };

            await this.minioClient.putObject(
                storageConfig.bucketName,
                fileId,
                fileStream,
                file.size,
                { 'Content-Type': file.mimetype, ...assetMetadata }
            );

            logger.info(`File uploaded successfully: ${fileId}`);

            return {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    fileId,
                    fileName: file.originalname,
                    fileSize: file.size,
                    mimeType: file.mimetype,
                    url: await this.generateFileUrl(fileId),
                    metadata
                }
            };
        } catch (error) {
            logger.error('Error uploading file:', error);
            throw new InternalServerError('UPLOAD_FAILED', 'Failed to upload file', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    private generateFileId(originalName: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '-');
        return `${timestamp}-${randomString}-${sanitizedName}`;
    }

    private async generateFileUrl(fileId: string): Promise<string> {
        try {
            // Generate a presigned URL that expires in 7 days
            const url = await this.minioClient.presignedGetObject(
                storageConfig.bucketName,
                fileId,
                7 * 24 * 60 * 60
            );
            return url;
        } catch (error) {
            logger.error('Error generating file URL:', error);
            throw error;
        }
    }

    public async getFileById(fileId: string): Promise<GetFileByIdResponse> {
        try {
            const stat = await this.minioClient.statObject(storageConfig.bucketName, fileId);
            const metadata = stat.metaData as AssetMetadata;

            if (!metadata) {
                throw new BadRequest('FILE_NOT_FOUND', 'File not found', `File with ID ${fileId} not found`);
            }

            return {
                success: true,
                message: 'File details retrieved successfully',
                data: {
                    fileId,
                    fileName: metadata.originalName,
                    fileSize: metadata.size,
                    mimeType: metadata.mimeType,
                    url: await this.generateFileUrl(fileId),
                    metadata: metadata.metadata,
                    uploadedAt: metadata.uploadedAt,
                    lastModified: metadata.lastModified
                }
            };
        } catch (error) {
            logger.error('Error retrieving file:', error);
            if (error.code === 'NotFound') {
                throw new BadRequest('FILE_NOT_FOUND', 'File not found', `File with ID ${fileId} not found`);
            }
            throw new InternalServerError('RETRIEVAL_FAILED', 'Failed to retrieve file', error instanceof Error ? error.message : 'Unknown error');
        }
    }
}
