import { Request, Response } from 'express';
import AuthService from 'services/auth.service';
import AsyncMiddleware  from 'util/async-handler';
import Success from 'server/responses/success-response/success';
import { ChangePasswordBody, LoginBody, LogoutBody, RefreshTokenBody, RegisterBody, RequestPasswordResetBody, ResetPasswordBody } from 'validations/auth.validation';

export class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    /**
     * Register a new user
     * @param req Express request object
     * @param res Express response object
     */
    register = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, RegisterBody>, res: Response) => {
            const userData = req.body;
            const result = await this.authService.register(userData);
            const response = new Success(result).toJson;
            return res.status(201).json(response);
        }
    );

    /**
     * Login a user
     * @param req Express request object
     * @param res Express response object
     */
    login = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, LoginBody>, res: Response) => {
            const { username, password } = req.body;
            const result = await this.authService.login(username, password);
            const response = new Success(result).toJson;
            return res.status(200).json(response);
        }
    );

    refreshToken = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, RefreshTokenBody>, res: Response) => {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            const response = new Success(result).toJson;
            return res.status(200).json(response);
        }
    );

    logout = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, LogoutBody>, res: Response) => {
            const { refreshToken } = req.body;
            await this.authService.logout(refreshToken);
            const response = new Success(null).toJson;
            return res.status(200).json(response);
        }
    );

    getProfile = AsyncMiddleware.asyncHandler(
        async (req: Request, res: Response) => {
            // @ts-ignore - userId is added by auth middleware
            const userId = req.userId;
            if (!userId) {
                throw new Error('User not found');
            }
            const user = await this.authService.getUserProfile(userId);
            const response = new Success(user).toJson;
            return res.status(200).json(response);
        }
    );

    changePassword = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, ChangePasswordBody>, res: Response) => {
            // @ts-ignore - userId is added by auth middleware
            const userId = req.userId;
            const { currentPassword, newPassword } = req.body;
            if (!userId) {
                throw new Error('User not found');
            }
            await this.authService.changePassword(userId, currentPassword, newPassword);
            const response = new Success(null).toJson;
            return res.status(200).json(response);
        }
    );

    requestPasswordReset = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, RequestPasswordResetBody>, res: Response) => {
            const { email } = req.body;
            await this.authService.requestPasswordReset(email);
            const response = new Success(null).toJson;
            return res.status(200).json(response);
        }
    );

    resetPassword = AsyncMiddleware.asyncHandler(
        async (req: Request<{}, any, ResetPasswordBody>, res: Response) => {
            const { token, newPassword } = req.body;
            await this.authService.resetPassword(token, newPassword);
            const response = new Success(null).toJson;
            return res.status(200).json(response);
        }
    );
}