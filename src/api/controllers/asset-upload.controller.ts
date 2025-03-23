import { Request, Response } from 'express';
import AssetUploadService from 'services/asset-upload.service';
import AsyncMiddleware from 'util/async-handler';
import Success from 'server/responses/success-response/success';
import { GetFileByIdParams } from 'common/interfaces/asset-upload.interface';

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

            const result = await this.assetUploadService.uploadFile(file, metadata);
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
            const result = await this.assetUploadService.getFileById(fileId);
            const response = new Success(result).toJson;
            return res.status(200).json(response);
        }
    );
}