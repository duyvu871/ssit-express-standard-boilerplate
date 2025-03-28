import { Router } from 'express';
import { AssetUploadController } from 'controllers/asset-upload.controller';
import { upload, validateFileUpload } from 'middlewares/file-validation.middleware';
import { authenticate } from 'middlewares/authenticate';

const assetUploadRouter = Router();
const assetUploadController = new AssetUploadController();

/**
 * @swagger
 * /asset/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Asset]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               metadata:
 *                 type: object
 *                 description: Additional metadata for the file
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *                     url:
 *                       type: string
 *                     metadata:
 *                       type: object
 *       400:
 *         description: Invalid file or file type not supported
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       413:
 *         description: File size exceeds the maximum limit
 */
assetUploadRouter.post(
    '/upload',
    authenticate,
    upload.single('file'),
    validateFileUpload,
    assetUploadController.uploadFile
);

/**
 * @swagger
 * /asset/list:
 *   get:
 *     summary: Get list of files for current user
 *     tags: [Asset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of files to return
 *       - in: query
 *         name: marker
 *         schema:
 *           type: string
 *         description: Marker for pagination
 *     responses:
 *       200:
 *         description: List of files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     files:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           fileId:
 *                             type: string
 *                           fileName:
 *                             type: string
 *                           fileSize:
 *                             type: number
 *                           mimeType:
 *                             type: string
 *                           url:
 *                             type: string
 *                           metadata:
 *                             type: object
 *                           uploadedAt:
 *                             type: string
 *                             format: date-time
 *                           lastModified:
 *                             type: string
 *                             format: date-time
 *                     nextMarker:
 *                       type: string
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
assetUploadRouter.get('/list', authenticate, assetUploadController.getFiles);

/**
 * @swagger
 * /asset/{fileId}:
 *   get:
 *     summary: Get file details by ID
 *     tags: [Asset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file to retrieve
 *     responses:
 *       200:
 *         description: File details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileId:
 *                       type: string
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: number
 *                     mimeType:
 *                       type: string
 *                     url:
 *                       type: string
 *                     metadata:
 *                       type: object
 *                     uploadedAt:
 *                       type: string
 *                       format: date-time
 *                     lastModified:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: File not found or invalid file ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
assetUploadRouter.get('/:fileId', authenticate, assetUploadController.getFileById);

/**
 * @swagger
 * /asset/{fileId}:
 *   delete:
 *     summary: Delete a file
 *     tags: [Asset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the file to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: File not found or invalid file ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 */
assetUploadRouter.delete('/:fileId', authenticate, assetUploadController.deleteFile);

export default assetUploadRouter;