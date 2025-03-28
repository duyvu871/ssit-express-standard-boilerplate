import { Client } from 'minio';
import { createMinioClient, storageConfig } from 'config/storage.config';
import logger from 'util/logger';

export class MinioLoader {
    private static instance: MinioLoader;
    private client: Client;

    constructor() {
        this.client = createMinioClient();
    }

    public static getInstance(): MinioLoader {
        if (!MinioLoader.instance) {
            MinioLoader.instance = new MinioLoader();
        }
        return MinioLoader.instance;
    }

    public getClient(): Client {
        return this.client;
    }

    public async initialize(): Promise<void> {
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                const bucketExists = await this.client.bucketExists(storageConfig.bucketName);

                if (!bucketExists) {
                    await this.client.makeBucket(storageConfig.bucketName);
                    logger.info(`Created bucket: ${storageConfig.bucketName}`);
                } else {
                    logger.info(`Using existing bucket: ${storageConfig.bucketName}`);
                }

                logger.info('MinIO client initialized successfully');
                return;
            } catch (error: any) {
                retryCount++;
                const isLastAttempt = retryCount === maxRetries;

                if (error.code === 'NoSuchBucket' || error.code === 'NotFound') {
                    logger.warn(`Bucket ${storageConfig.bucketName} not found, attempting to create...`);
                    try {
                        await this.client.makeBucket(storageConfig.bucketName);
                        logger.info(`Successfully created bucket: ${storageConfig.bucketName}`);
                        return;
                    } catch (createError) {
                        logger.error(`Failed to create bucket on attempt ${retryCount}:`, createError);
                    }
                }

                if (isLastAttempt) {
                    logger.error(`Failed to initialize MinIO client after ${maxRetries} attempts:`, error);
                    throw new Error(`MinIO initialization failed: ${error.message || error}`);
                } else {
                    logger.warn(`Retrying MinIO initialization (attempt ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                }
            }
        }
    }
}

export const initializeMinio = async (): Promise<void> => {
    const minioLoader = MinioLoader.getInstance();
    await minioLoader.initialize();
};

export const getMinioClient = (): Client => {
    return MinioLoader.getInstance().getClient();
};