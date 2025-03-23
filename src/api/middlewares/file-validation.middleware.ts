import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { FileType, MAX_FILE_SIZES } from 'common/enums/file-types.enum';
import logger from 'util/logger';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const mimeType = file.mimetype as FileType;
    const maxSize = MAX_FILE_SIZES[mimeType];

    if (!maxSize) {
        logger.warn(`Rejected file upload: Unsupported file type ${mimeType}`);
        cb(null, false);
        return;
    }

    // Validate file extension matches mimetype
    const extension = path.extname(file.originalname).toLowerCase();
    const validExtensions: { [key in FileType]?: string[] } = {
        [FileType.JPEG]: ['.jpg', '.jpeg'],
        [FileType.PNG]: ['.png'],
        [FileType.GIF]: ['.gif'],
        [FileType.WEBP]: ['.webp'],
        [FileType.SVG]: ['.svg'],
        [FileType.PDF]: ['.pdf'],
        [FileType.DOC]: ['.doc'],
        [FileType.DOCX]: ['.docx'],
        [FileType.XLS]: ['.xls'],
        [FileType.XLSX]: ['.xlsx'],
        [FileType.PPT]: ['.ppt'],
        [FileType.PPTX]: ['.pptx'],
        [FileType.ZIP]: ['.zip'],
        [FileType.RAR]: ['.rar'],
        [FileType._7Z]: ['.7z'],
        [FileType.TXT]: ['.txt'],
        [FileType.CSV]: ['.csv'],
        [FileType.JSON]: ['.json'],
        [FileType.XML]: ['.xml']
    };

    if (!validExtensions[mimeType]?.includes(extension)) {
        logger.warn(`Rejected file upload: File extension ${extension} does not match mimetype ${mimeType}`);
        cb(null, false);
        return;
    }

    cb(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: Math.max(...Object.values(MAX_FILE_SIZES))
    }
});

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded or file type not supported'
        });
    }

    const mimeType = req.file.mimetype as FileType;
    const maxSize = MAX_FILE_SIZES[mimeType];

    if (req.file.size > maxSize) {
        return res.status(400).json({
            success: false,
            message: `File size exceeds the maximum limit of ${maxSize / (1024 * 1024)}MB for ${mimeType} files`
        });
    }

    // Sanitize filename to prevent path traversal
    req.file.originalname = path.basename(req.file.originalname);

    next();
};