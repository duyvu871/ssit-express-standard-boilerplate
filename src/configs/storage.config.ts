import { Client } from 'minio';
import { config } from 'dotenv';

config();

export interface StorageConfig {
    endPoint: string;
    port: number;
    useSSL: boolean;
    accessKey: string;
    secretKey: string;
    bucketName: string;
}

export const storageConfig: StorageConfig = {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucketName: process.env.MINIO_BUCKET_NAME || 'assets'
};

export const createMinioClient = (): Client => {
    return new Client({
        endPoint: storageConfig.endPoint,
        port: storageConfig.port,
        useSSL: storageConfig.useSSL,
        accessKey: storageConfig.accessKey,
        secretKey: storageConfig.secretKey
    });
};