import { Client } from 'minio';
import { createMinioClient, storageConfig } from 'config/storage.config';
import logger from 'util/logger';

export class MinioLoader {
    private static instance: MinioLoader;
    private client: Client;

    private constructor() {
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
        try {
            const bucketExists = await this.client.bucketExists(storageConfig.bucketName);

            if (!bucketExists) {
                await this.client.makeBucket(storageConfig.bucketName);
                logger.info(`Created bucket: ${storageConfig.bucketName}`);
            }

            logger.info('MinIO client initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize MinIO client:', error);
            throw error;
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