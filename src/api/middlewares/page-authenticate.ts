import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Unauthorized from 'responses/client-errors/unauthorized';
import { AuthMiddlewareErrorMessage } from 'common/enums/auth-middleware-error.enum';
import { TokenErrorMessage } from 'common/enums/token-error.enum';
import TokenService from 'services/token.service';
import { tokenValidation } from 'validations/token.validation';
import logger from 'util/logger';

// Extend Express Request interface to include user properties
declare global {
    namespace Express {
        interface Request {
            userId?: number;
            username?: string;
            userRoles?: string[];
        }
    }
}

/**
 * Middleware to authenticate page requests using JWT from cookies
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const pageAuthenticate = (loginPath: string = '/auth/login') => (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info(`Page authentication attempt for request to ${req.method} ${req.originalUrl}`);
        
        // Get the access token from cookies
        const token = req.cookies.accessToken;
        if (!token) {
            logger.warn('Page authentication failed: Missing access token in cookies');
            return res.redirect(loginPath);
        }

        // Use TokenService to verify the token
        const tokenService = new TokenService();
        const decoded = tokenService.verifyAccessToken(token);

        // Validate decoded token using Zod schema
        const validationResult = tokenValidation.decodedToken.safeParse(decoded);
        if (!validationResult.success) {
            logger.warn('Page authentication failed: Invalid token format', { error: validationResult.error.message });
            return res.redirect(loginPath);
        }

        const validatedToken = validationResult.data;

        // Validate token expiration
        if (Date.now() >= validatedToken.exp) {
            logger.warn('Page authentication failed: Token expired');
            return res.redirect(loginPath);
        }

        // Validate token not-before time
        if (validatedToken.nbf && Date.now() < validatedToken.nbf) {
            logger.warn('Page authentication failed: Token not yet valid');
            return res.redirect(loginPath);
        }

        // Add validated user information to the request object
        req.userId = validatedToken.payload.userId;
        req.username = validatedToken.payload.username;
        req.userRoles = validatedToken.payload.roles;
        
        // Store deviceId in request if available (for multi-device support)
        if (validatedToken.payload.deviceId) {
            (req as any).deviceId = validatedToken.payload.deviceId;
        }

        logger.info('Page authentication successful', { 
            userId: validatedToken.payload.userId,
            username: validatedToken.payload.username,
            path: req.originalUrl
        });

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            logger.error('Page authentication failed: Invalid token signature', {
                error: error.message,
                path: req.originalUrl
            });
            return res.redirect(loginPath);
        } else if (error instanceof jwt.TokenExpiredError) {
            logger.error('Page authentication failed: Token expired', { 
                error: error.message,
                path: req.originalUrl
            });
            return res.redirect(loginPath);
        } else {
            logger.error('Page authentication failed', { 
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.originalUrl
            });
            return res.redirect(loginPath);
        }
    }
};

/**
 * Middleware to check if user has required roles for page access
 * @param roles Array of required roles
 * @returns Middleware function
 */
export const pageHasRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.userRoles || [];
            const userId = req.userId;

            logger.info('Checking user roles for page access', { 
                userId,
                requiredRoles: roles,
                userRoles,
                path: req.originalUrl
            });

            // Check if user has any of the required roles
            const hasRequiredRole = roles.some(role => userRoles.includes(role));
            if (!hasRequiredRole) {
                logger.warn('Page authorization failed: Insufficient permissions', {
                    userId,
                    requiredRoles: roles,
                    userRoles,
                    path: req.originalUrl
                });
                throw new Unauthorized('INSUFFICIENT_PERMISSIONS', AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS, AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS);
            }

            logger.info('Page role check passed', { userId, path: req.originalUrl });
            next();
        } catch (error) {
            logger.error('Page role check failed', { 
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: req.userId,
                path: req.originalUrl
            });

            next(error);
        }
    };
};