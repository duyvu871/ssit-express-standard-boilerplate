import { Request } from 'express';
import multer, { FileFilterCallback, StorageEngine, Options } from 'multer';
import path from 'path';
import { FileType, MAX_FILE_SIZES } from 'common/enums/file-types.enum';
import logger from 'util/logger';
import BadRequest from 'responses/client-errors/bad-request';
import UnprocessableEntity from 'responses/client-errors/unprocessable-entity';

/**
 * @interface UploadOptions
 * @description Configuration options for the upload middleware
 * @property {StorageEngine} [storage] - Custom storage engine (defaults to disk storage)
 * @property {FileType[]} [fileTypes] - Array of allowed file types (MIME types)
 * @property {number} [maxFileSize] - Maximum file size in bytes
 * @property {string} [destination] - Upload destination directory
 * @property {Function} [filename] - Custom filename generator function
 * @property {Record<string, unknown>} [metadata] - Additional metadata to attach to files
 * @property {boolean} [validateOriginalFilename] - Enable original filename validation
 * @property {string[]} [allowedExtensions] - Array of allowed file extensions
 * @property {Options['limits']} [limits] - Additional Multer limits options
 */
export interface UploadOptions {
    storage?: StorageEngine;
    fileTypes?: FileType[];
    maxFileSize?: number;
    destination?: string;
    filename?: (req: Request, file: Express.Multer.File) => string;
    metadata?: Record<string, unknown>;
    validateOriginalFilename?: boolean;
    allowedExtensions?: string[];
    limits?: Options['limits'];
}

const DEFAULT_UPLOAD_DIR = 'storage/assets/main';

/**
 * @function generateFilename
 * @description Generates a unique filename using timestamp and random number
 * @param {Express.Multer.File} file - The uploaded file
 * @returns {string} Generated unique filename with original extension
 */
const generateFilename = (file: Express.Multer.File): string => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    return `${timestamp}-${random}${extension}`;
};

/**
 * @function validateFileType
 * @description Validates if the file's MIME type is allowed
 * @param {Express.Multer.File} file - The uploaded file
 * @param {FileType[]} [allowedTypes] - Array of allowed MIME types
 * @returns {boolean} True if file type is allowed, false otherwise
 */
const validateFileType = (file: Express.Multer.File, allowedTypes?: FileType[]): boolean => {
    if (!allowedTypes || allowedTypes.length === 0) {
        return Object.values(FileType).includes(file.mimetype as FileType);
    }
    return allowedTypes.includes(file.mimetype as FileType);
};

/**
 * @function validateFileExtension
 * @description Validates if the file's extension is allowed
 * @param {Express.Multer.File} file - The uploaded file
 * @param {string[]} [allowedExtensions] - Array of allowed file extensions
 * @returns {boolean} True if file extension is allowed, false otherwise
 */
const validateFileExtension = (file: Express.Multer.File, allowedExtensions?: string[]): boolean => {
    if (!allowedExtensions || allowedExtensions.length === 0) return true;
    const extension = path.extname(file.originalname).toLowerCase();
    return allowedExtensions.includes(extension);
};

/**
 * @function createStorage
 * @description Creates a Multer storage engine based on provided options
 * @param {UploadOptions} options - Upload configuration options
 * @returns {StorageEngine} Configured Multer storage engine
 */
const createStorage = (options: UploadOptions): StorageEngine => {
    return options.storage || multer.diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb) => {
            const uploadDir = options.destination || DEFAULT_UPLOAD_DIR;
            cb(null, uploadDir);
        },
        filename: (req: Request, file: Express.Multer.File, cb) => {
            const filename = options.filename ?
                options.filename(req, file) :
                generateFilename(file);
            cb(null, filename);
        }
    });
};

/**
 * @function createFileFilter
 * @description Creates a Multer file filter function based on provided options
 * @param {UploadOptions} options - Upload configuration options
 * @returns {Function} File filter function for Multer
 */
const createFileFilter = (options: UploadOptions) => {
    return (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
        try {
            // Validate file type
            if (!validateFileType(file, options.fileTypes)) {
                const error = new BadRequest(
                    'UNSUPPORTED_FILE_TYPE',
                    'File type not supported',
                    `File type ${file.mimetype} is not supported`
                );
                logger.warn(`Rejected file upload: Unsupported file type ${file.mimetype}`);
                return cb(error);
            }

            // Validate file extension
            if (!validateFileExtension(file, options.allowedExtensions)) {
                const error = new BadRequest(
                    'INVALID_FILE_EXTENSION',
                    'Invalid file extension',
                    `File extension for ${file.originalname} is not allowed`
                );
                logger.warn(`Rejected file upload: Invalid file extension for ${file.originalname}`);
                return cb(error);
            }

            // Validate original filename if required
            if (options.validateOriginalFilename) {
                const sanitizedFilename = path.basename(file.originalname);
                if (sanitizedFilename !== file.originalname) {
                    const error = new UnprocessableEntity(
                        'INVALID_ORIGINAL_FILENAME',
                        'Invalid original filename',
                        `Invalid characters in filename ${file.originalname}`
                    );
                    logger.warn(`Rejected file upload: Invalid original filename ${file.originalname}`);
                    return cb(error);
                }
            }

            // Add metadata if provided
            if (options.metadata) {
                file.metadata = options.metadata;
            }

            cb(null, true);
        } catch (error) {
            logger.error('File validation error:', error);
            cb(new UnprocessableEntity(
                'FILE_VALIDATION_ERROR',
                'File validation failed',
                'An error occurred while validating the file'
            ));
        }
    };
};

/**
 * @function uploadMiddleware
 * @description Creates a configured Multer middleware for handling file uploads
 * @param {UploadOptions} [options={}] - Upload configuration options
 * @returns {Multer} Configured Multer middleware
 * 
 * @example
 * // Basic usage with default options
 * app.post('/upload', uploadMiddleware().single('file'), handler);
 * 
 * @example
 * // Configure with specific file types and size limit
 * const uploadConfig = {
 *   fileTypes: [FileType.JPEG, FileType.PNG],
 *   maxFileSize: 5 * 1024 * 1024, // 5MB
 *   allowedExtensions: ['.jpg', '.jpeg', '.png']
 * };
 * app.post('/upload-image', uploadMiddleware(uploadConfig).single('image'), handler);
 * 
 * @example
 * // Custom filename and metadata
 * const uploadConfig = {
 *   filename: (req, file) => `${req.user.id}-${file.originalname}`,
 *   metadata: { uploadedBy: 'user123' },
 *   validateOriginalFilename: true
 * };
 * app.post('/upload-document', uploadMiddleware(uploadConfig).single('document'), handler);
 */
export const uploadMiddleware = (options: UploadOptions = {}) => {
    const storage = createStorage(options);
    const fileFilter = createFileFilter(options);
    const maxFileSize = options.maxFileSize || Math.max(...Object.values(MAX_FILE_SIZES));

    return multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxFileSize,
            ...options.limits
        }
    });
};