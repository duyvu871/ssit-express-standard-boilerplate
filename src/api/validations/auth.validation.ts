import { z } from 'zod';

export const authValidation = {
    /**
     * Validation schema for user registration
     */
    registerBody: z.object({
        username: z.string().min(3).max(50),
        email: z.string().email().max(100),
        password: z.string().min(8).max(100),
        firstName: z.string().min(1).max(50).optional(),
        lastName: z.string().min(1).max(50).optional(),
    }),

    /**
     * Validation schema for user login
     */
    loginBody: z.object({
        username: z.string().min(1),
        password: z.string().min(1),
    }),

    /**
     * Validation schema for refresh token
     */
    refreshTokenBody: z.object({
        refreshToken: z.string().min(1),
    }),

    /**
     * Validation schema for logout
     */
    logoutBody: z.object({
        refreshToken: z.string().min(1),
    }),

    /**
     * Validation schema for change password
     */
    changePasswordBody: z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8).max(100),
    }),

    /**
     * Validation schema for request password reset
     */
    requestPasswordResetBody: z.object({
        email: z.string().email(),
    }),

    /**
     * Validation schema for reset password
     */
    resetPasswordBody: z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8).max(100),
    }),
};

export type RegisterBody = z.infer<typeof authValidation.registerBody>;
export type LoginBody = z.infer<typeof authValidation.loginBody>;
export type RefreshTokenBody = z.infer<typeof authValidation.refreshTokenBody>;
export type LogoutBody = z.infer<typeof authValidation.logoutBody>;
export type ChangePasswordBody = z.infer<typeof authValidation.changePasswordBody>;
export type RequestPasswordResetBody = z.infer<typeof authValidation.requestPasswordResetBody>;
export type ResetPasswordBody = z.infer<typeof authValidation.resetPasswordBody>;