import { Readable } from 'stream';
import { Client } from 'minio';
import { getMinioClient, MinioLoader } from 'loader/minio.loader';
import { storageConfig } from 'config/storage.config';
import { AssetMetadata, AssetUploadResponse, GetFileByIdResponse } from 'common/interfaces/asset-upload.interface';
import logger from 'util/logger';
import BadRequest from 'responses/client-errors/bad-request';
import InternalServerError from 'responses/server-errors/internal-server-error';
import appConfig from 'server/configs/app.config';

/**
 * Service class for handling file uploads to MinIO storage
 * Provides functionality for uploading, retrieving, and managing files
 */
export default class AssetUploadService {
    private minioClient: Client;

    /**
     * Initializes the AssetUploadService with a MinIO client instance
     */
    constructor() {
        this.minioClient = getMinioClient();
    }

    /**
     * Uploads a file to MinIO storage with associated metadata
     * @param file - The file to upload (must be a Multer file object)
     * @param userId - The ID of the user uploading the file
     * @param metadata - Optional additional metadata to store with the file
     * @returns Promise containing upload response with file details
     * @throws {BadRequest} When file is missing or invalid
     * @throws {InternalServerError} When upload fails
     */
    public async uploadFile(file: Express.Multer.File, userId: string | number, metadata?: Record<string, unknown>): Promise<AssetUploadResponse['data']> {
        if (!file) {
            throw new BadRequest('FILE_REQUIRED', 'File is required', 'No file was provided for upload');
        }

        if (!file.buffer || !file.originalname || !file.size || !file.mimetype) {
            throw new BadRequest('INVALID_FILE', 'Invalid file format', 'The provided file is missing required properties');
        }

        try {
            const fileId = this.generateFileId(file.originalname);
            const fileStream = Readable.from(file.buffer);

            const stringifiedMetadata = JSON.stringify(metadata);
            const assetMetadata: AssetMetadata = {
                original_name: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                uploaded_at: new Date(),
                user_id: userId,
                metadata: stringifiedMetadata
            };

            const userPrefix = `users/${userId}/`;
            const objectKey = `${userPrefix}${fileId}`;
            
            const putObject = await this.minioClient.putObject(
                storageConfig.bucketName,
                objectKey,
                fileStream,
                file.size,
                { 'Content-Type': file.mimetype, ...assetMetadata }
            );

            logger.info(`File uploaded successfully: ${fileId}`);

            return {
                fileId,
                fileName: file.originalname,
                fileSize: file.size,
                mimetype: file.mimetype,
                url: await this.generateFileUrl(objectKey),
                metadata
            };
        } catch (error) {
            logger.error('Error uploading file:', error);
            throw error;
        }
    }

    /**
     * Generates a unique file ID based on timestamp, random string, and original filename
     * @param originalName - Original name of the uploaded file
     * @returns Generated unique file ID
     * @private
     */
    private generateFileId(originalName: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const sanitizedName = originalName.replace(/[^a-zA-Z0-9]/g, '-');
        return `${timestamp}-${randomString}-${sanitizedName}`;
    }

    /**
     * Generates a presigned URL for accessing the file
     * @param fileId - The ID of the file to generate URL for
     * @returns Promise containing the presigned URL
     * @throws {Error} When URL generation fails
     * @private
     */
    private async generateFileUrl(objectKey: string): Promise<string> {
        try {
            // Generate a presigned URL that expires in 7 days
            const url = await this.minioClient.presignedGetObject(
                storageConfig.bucketName,
                objectKey,
                7 * 24 * 60 * 60
            );

            // Construct the full URL
            const cdnUrl = url.replace(
                /^https?:\/\/[^/]+/,
                appConfig.minioUrl,
            );

            return cdnUrl;
        } catch (error) {
            logger.error('Error generating file URL:', error);
            throw error;
        }
    }

    /**
     * Retrieves a list of files for a specific user with pagination support
     * @param userId - The ID of the user whose files to retrieve
     * @param limit - Maximum number of files to return (default: 100)
     * @param marker - Pagination marker for retrieving next set of files
     * @returns Promise containing array of file details and next marker if available
     * @throws {InternalServerError} When file retrieval fails
     */
    public async getFiles(userId: string | number, limit: number = 100, marker?: string): Promise<{ files: GetFileByIdResponse['data'][], nextMarker?: string }> {
        try {
            const userPrefix = `users/${userId}/`;
            const objectsList = await this.minioClient.listObjectsV2(storageConfig.bucketName, userPrefix, true);
            const files: GetFileByIdResponse['data'][] = [];
            let currentMarker = marker;
            let count = 0;

            for await (const obj of objectsList) {
                if (marker && obj.name <= marker) {
                    continue;
                }

                try {
                    // Ensure we're using the full object path
                    const objectKey = obj.name;
                    // Retrieve the metadata for the object
                    const stat = await this.minioClient.statObject(storageConfig.bucketName, objectKey);
                    
                    if (!stat || !stat.metaData) {
                        logger.warn(`Missing metadata for file ${objectKey}`);
                        continue;
                    }
                    // Parse the metadata
                    const metadata = stat.metaData as AssetMetadata;
                    console.log('Metadata:', metadata);
                    
                    if (!metadata.original_name || !metadata.size || !metadata.mimetype) {
                        logger.warn(`Incomplete metadata for file ${objectKey}`);
                        continue;
                    }

                    files.push({
                        fileId: objectKey,
                        fileName: metadata.original_name,
                        fileSize: metadata.size,
                        mimetype: metadata.mimetype,
                        url: await this.generateFileUrl(objectKey),
                        metadata: metadata.metadata,
                        uploadedAt: metadata.uploaded_at,
                        lastModified: stat.lastModified
                    });

                    count++;
                    currentMarker = objectKey;

                    if (count >= limit) {
                        break;
                    }
                } catch (error) {
                    if (error.code === 'NotFound') {
                        logger.warn(`File not found: ${obj.name}`);
                        continue;
                    }
                    logger.error(`Error retrieving file ${obj.name}:`, error);
                }
            }

            return {
                files,
                nextMarker: count >= limit ? currentMarker : undefined
            };
        } catch (error) {
            logger.error('Error listing files:', error);
            throw new InternalServerError('RETRIEVAL_FAILED', 'Failed to list files', error instanceof Error ? error.message : 'Unknown error');
        }
    }

    /**
     * Retrieves a specific file by its ID
     * @param fileId - The ID of the file to retrieve
     * @param userId - The ID of the user requesting the file
     * @returns Promise containing file details
     * @throws {BadRequest} When file is not found or user is unauthorized
     * @throws {InternalServerError} When file retrieval fails
     */
    public async getFileById(fileId: string, userId: string | number): Promise<GetFileByIdResponse['data']> {
        try {
            const userPrefix = `users/${userId}/`;
            const objectKey = `${userPrefix}${fileId}`;
            // First check if the file exists and user has permission
            const stat = await this.minioClient.statObject(storageConfig.bucketName, objectKey);
            const metadata = stat.metaData as AssetMetadata;

            if (!metadata) {
                throw new BadRequest('FILE_NOT_FOUND', 'File not found', `File with ID ${fileId} not found`);
            }

            if (metadata.user_id !== userId) {
                throw new BadRequest('UNAUTHORIZED', 'Unauthorized access', 'You do not have permission to access this file');
            }

            return {
                fileId,
                fileName: metadata.original_name,
                fileSize: metadata.size,
                mimetype: metadata.mimetype,
                url: await this.generateFileUrl(objectKey),
                metadata: metadata.metadata,
                uploadedAt: metadata.uploaded_at,
                lastModified: metadata.last_modified
            };
        } catch (error) {
            logger.error('Error retrieving file:', error);
            throw error;
        }
    }

    /**
     * Deletes a file from MinIO storage
     * @param fileId - The ID of the file to delete
     * @param userId - The ID of the user requesting deletion
     * @throws {BadRequest} When file is not found or user is unauthorized
     * @throws {InternalServerError} When deletion fails
     */
    public async deleteFile(fileId: string, userId: string | number): Promise<void> {
        try {
            const userPrefix = `users/${userId}/`;
            const objectKey = `${userPrefix}${fileId}`;
            // First check if the file exists and user has permission
            const stat = await this.minioClient.statObject(storageConfig.bucketName, objectKey);
            const metadata = stat.metaData as AssetMetadata;

            if (!metadata) {
                throw new BadRequest('FILE_NOT_FOUND', 'File not found', `File with ID ${fileId} not found`);
            }

            if (metadata.user_id !== userId) {
                throw new BadRequest('UNAUTHORIZED', 'Unauthorized access', 'You do not have permission to delete this file');
            }

            // Delete the file
            await this.minioClient.removeObject(storageConfig.bucketName, objectKey);
            logger.info(`File deleted successfully: ${fileId}`);
        } catch (error) {
            logger.error('Error deleting file:', error);
            throw error;
        }
    }
}
