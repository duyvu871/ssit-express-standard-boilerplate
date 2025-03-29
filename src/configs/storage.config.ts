import { Client } from 'minio';
import dotenv from 'dotenv';
import { join } from 'path';

if (process.env.NODE_ENV !== 'test') {
    const ENV_FILE_PATH = join(process.cwd(), process.env.NODE_ENV === "production" ? ".env" : ".env.local");
    const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });
    if (isEnvFound.error) {
        throw new Error(`Cannot find ${process.env.NODE_ENV === "production" ? ".env" : ".env.local"} file.`);
    }
} else {
    console.info(new Date(), '[ExpressServer]: Skipped loading .env file in test environment');
}

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
    const client = new Client({
        endPoint: storageConfig.endPoint,
        port: storageConfig.port,
        useSSL: storageConfig.useSSL,
        accessKey: storageConfig.accessKey,
        secretKey: storageConfig.secretKey,
    });
    // client.setRequestOptions({ signatureVersion: 'v4' });
    return client;
};