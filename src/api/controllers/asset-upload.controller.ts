import { Request, Response } from 'express';
import { GetFileByIdParams } from 'common/interfaces/asset-upload.interface';
import AssetUploadService from 'services/asset-upload.service';
import AsyncMiddleware from 'util/async-handler';
import Success from 'server/responses/success-response/success';
import BadRequest from 'server/responses/client-errors/bad-request';

export class AssetUploadController {
    private assetUploadService: AssetUploadService;

    constructor() {
        this.assetUploadService = new AssetUploadService();
    }
    /**
     * Upload a file to storage
     * @param req Express request object
     * @param res Express response object
     */
    uploadFile = AsyncMiddleware.asyncHandler(
        async (req: Request, res: Response) => {
            const file = req.file as Express.Multer.File;
            const metadata = req.body.metadata ? JSON.parse(req.body.metadata) : undefined;
            const userId = req?.userId;
            if (!userId) throw new BadRequest('Invalid_user_id', 'Invalid user ID', 'Invalid user ID');

            const result = await this.assetUploadService.uploadFile(file, userId, metadata);
            const response = new Success(result).toJson;
            return res.status(201).json(response);
        }
    );

    /**
     * Get file details by ID
     * @param req Express request object
     * @param res Express response object
     */
    getFileById = AsyncMiddleware.asyncHandler(
        async (req: Request<GetFileByIdParams>, res: Response) => {
            const { fileId } = req.params;
            const userId = req?.userId;
            if (!userId) throw new BadRequest('Invalid_user_id', 'Invalid user ID', 'Invalid user ID');

            const result = await this.assetUploadService.getFileById(fileId, userId);
            const response = new Success(result).toJson;
            return res.status(200).json(response);
        }
    );

    /**
     * Get all files for the current user
     * @param req Express request object
     * @param res Express response object
     */
    getFiles = AsyncMiddleware.asyncHandler(
        async (req: Request, res: Response) => {
            try {
                const userId = req?.userId;
                if (!userId) throw new BadRequest('Invalid_user_id', 'Invalid user ID', 'Invalid user ID');

                const limit = parseInt(req.query.limit as string) || 100;
                const marker = req.query.marker as string;

                const result = await this.assetUploadService.getFiles(userId, limit, marker);
                const response = new Success(result).toJson;
                return res.status(200).json(response);
            } catch (error) {
                throw error;
            }
        }
    );

    /**
     * Delete a file
     * @param req Express request object
     * @param res Express response object
     */
    deleteFile = AsyncMiddleware.asyncHandler(
        async (req: Request<GetFileByIdParams>, res: Response) => {
            const { fileId } = req.params;
            const userId = req?.userId;
            if (!userId) throw new BadRequest('Invalid_user_id', 'Invalid user ID', 'Invalid user ID');

            await this.assetUploadService.deleteFile(fileId, userId);
            const response = new Success(null).toJson;
            return res.status(200).json(response);
        }
    );
}