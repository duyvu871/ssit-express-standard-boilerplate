# MinIO Integration Guide

## Overview
This guide explains how MinIO object storage is integrated into the project for handling file storage and management. MinIO provides a scalable, secure, and S3-compatible object storage solution.

## Configuration

### Environment Variables
```env
MINIO_ENDPOINT=your-minio-endpoint
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET_NAME=your-bucket-name
```

### Storage Configuration
The MinIO client configuration is managed in `src/configs/storage.config.ts`:

```typescript
export const storageConfig = {
    endpoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME
};
```

## Initialization
MinIO client initialization is handled in `src/loaders/minio.loader.ts`. The loader ensures bucket existence and proper configuration:

```typescript
import { Client } from 'minio';
import { storageConfig } from '../configs/storage.config';

let minioClient: Client;

export const initializeMinIO = async () => {
    minioClient = new Client({
        endPoint: storageConfig.endpoint,
        port: storageConfig.port,
        useSSL: storageConfig.useSSL,
        accessKey: storageConfig.accessKey,
        secretKey: storageConfig.secretKey
    });

    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(storageConfig.bucketName);
    if (!bucketExists) {
        await minioClient.makeBucket(storageConfig.bucketName);
    }
};

export const getMinioClient = () => minioClient;
```

## Usage Examples

### File Upload
The `AssetUploadService` demonstrates file upload implementation:

```typescript
public async uploadFile(file: Express.Multer.File, metadata?: Record<string, unknown>) {
    const fileId = this.generateFileId(file.originalname);
    const fileStream = Readable.from(file.buffer);

    await getMinioClient().putObject(
        storageConfig.bucketName,
        fileId,
        fileStream,
        file.size,
        { 'Content-Type': file.mimetype, ...metadata }
    );

    return {
        fileId,
        url: await this.generateFileUrl(fileId),
        // ... other response data
    };
}
```

### File Download
```typescript
public async downloadFile(fileId: string) {
    const fileStream = await getMinioClient().getObject(
        storageConfig.bucketName,
        fileId
    );
    return fileStream;
}
```

### Get File Metadata
```typescript
public async getFileMetadata(fileId: string) {
    const stat = await getMinioClient().statObject(
        storageConfig.bucketName,
        fileId
    );
    return stat;
}
```

## Security Best Practices

1. **Access Control**
   - Use IAM policies to restrict bucket access
   - Implement proper user authentication
   - Use presigned URLs for temporary access

2. **Data Protection**
   - Enable server-side encryption
   - Configure TLS/SSL for data in transit
   - Implement bucket versioning for data recovery

3. **File Validation**
   - Validate file types and sizes
   - Sanitize file names
   - Implement virus scanning (optional)

## Error Handling

Implement proper error handling for common MinIO operations:

```typescript
try {
    await minioClient.putObject(...);
} catch (error) {
    if (error.code === 'NoSuchBucket') {
        // Handle bucket not found
    } else if (error.code === 'AccessDenied') {
        // Handle access denied
    } else {
        // Handle other errors
    }
}
```

## Performance Optimization

1. **Streaming Large Files**
   - Use streams for large file operations
   - Implement chunked upload for better memory management

2. **Caching**
   - Implement caching for frequently accessed files
   - Use CDN for better content delivery

3. **Compression**
   - Compress files before upload when appropriate
   - Use appropriate compression algorithms based on file type

## Monitoring and Logging

1. **Metrics**
   - Monitor storage usage
   - Track upload/download speeds
   - Monitor error rates

2. **Logging**
   - Log all file operations
   - Implement audit logging for sensitive operations
   - Use structured logging for better analysis

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Verify MinIO endpoint and credentials
   - Check network connectivity
   - Verify SSL configuration

2. **Permission Issues**
   - Verify bucket policies
   - Check file permissions
   - Verify access keys

3. **Performance Issues**
   - Monitor resource usage
   - Check network bandwidth
   - Optimize file sizes and formats

## Maintenance

1. **Backup Strategy**
   - Implement regular backups
   - Test backup restoration
   - Document backup procedures

2. **Cleanup Procedures**
   - Implement file retention policies
   - Clean up temporary files
   - Monitor storage usage

## References

- [MinIO JavaScript Client API Reference](https://min.io/docs/minio/linux/developers/javascript/API.html)
- [MinIO Security Guide](https://min.io/docs/minio/linux/operations/security.html)
- [MinIO Performance Guide](https://min.io/docs/minio/linux/operations/monitoring.html)