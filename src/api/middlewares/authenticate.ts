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
 * Middleware to authenticate requests using JWT
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        logger.info(`Authentication attempt for request to ${req.method} ${req.originalUrl}`);
        
        // Get the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            logger.warn('Authentication failed: Missing authorization header');
            throw new Unauthorized('AUTH_HEADER_REQUIRED', AuthMiddlewareErrorMessage.AUTH_HEADER_REQUIRED, AuthMiddlewareErrorMessage.AUTH_HEADER_REQUIRED);
        }

        // Check if the header format is valid
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            logger.warn('Authentication failed: Invalid authorization format');
            throw new Unauthorized('INVALID_AUTH_FORMAT', AuthMiddlewareErrorMessage.INVALID_AUTH_FORMAT, AuthMiddlewareErrorMessage.INVALID_AUTH_FORMAT);
        }

        const token = parts[1];
        if (!token) {
            logger.warn('Authentication failed: Token is empty');
            throw new Unauthorized('TOKEN_REQUIRED', AuthMiddlewareErrorMessage.TOKEN_REQUIRED, AuthMiddlewareErrorMessage.TOKEN_REQUIRED);
        }

        // Use TokenService to verify the token
        const tokenService = new TokenService();
        const decoded = tokenService.verifyAccessToken(token);

        // Validate decoded token using Zod schema
        const validationResult = tokenValidation.decodedToken.safeParse(decoded);
        if (!validationResult.success) {
            logger.warn('Authentication failed: Invalid token format', { error: validationResult.error.message });
            throw new Unauthorized('INVALID_TOKEN_FORMAT', TokenErrorMessage.INVALID_TOKEN_FORMAT, validationResult.error.message);
        }

        const validatedToken = validationResult.data;

        // Validate token expiration
        if (Date.now() >= validatedToken.exp) {
            logger.warn('Authentication failed: Token expired');
            throw new Unauthorized('EXPIRED_TOKEN', TokenErrorMessage.TOKEN_EXPIRED, TokenErrorMessage.TOKEN_EXPIRED);
        }

        // Validate token not-before time
        if (validatedToken.nbf && Date.now() < validatedToken.nbf) {
            logger.warn('Authentication failed: Token not yet valid');
            throw new Unauthorized('TOKEN_NOT_YET_VALID', TokenErrorMessage.TOKEN_NOT_YET_VALID, TokenErrorMessage.TOKEN_NOT_YET_VALID);
        }

        // Add validated user information to the request object
        req.userId = validatedToken.payload.userId;
        req.username = validatedToken.payload.username;
        req.userRoles = validatedToken.payload.roles;
        
        // Store deviceId in request if available (for multi-device support)
        if (validatedToken.payload.deviceId) {
            (req as any).deviceId = validatedToken.payload.deviceId;
        }

        logger.info('Authentication successful', { 
            userId: validatedToken.payload.userId,
            username: validatedToken.payload.username,
            path: req.originalUrl
        });

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            logger.error('Authentication failed: Invalid token signature', {
                error: error.message,
                path: req.originalUrl
            });
            next(new Unauthorized('INVALID_TOKEN', TokenErrorMessage.INVALID_SIGNATURE, TokenErrorMessage.INVALID_SIGNATURE));
        } else if (error instanceof jwt.TokenExpiredError) {
            logger.error('Authentication failed: Token expired', { 
                error: error.message,
                path: req.originalUrl
            });
            next(new Unauthorized('TOKEN_EXPIRED', TokenErrorMessage.TOKEN_EXPIRED, TokenErrorMessage.TOKEN_EXPIRED));
        } else {
            console.log("auth error:", error);
            
            logger.error('Authentication failed', { 
                error: error instanceof Error ? error.message : 'Unknown error',
                path: req.originalUrl
            });
            next(error);
        }
    }
};

/**
 * Middleware to check if user has required roles
 * @param roles Array of required roles
 * @returns Middleware function
 */
export const hasRoles = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRoles = req.userRoles || [];
            const userId = req.userId;

            logger.info('Checking user roles', { 
                userId,
                requiredRoles: roles,
                userRoles,
                path: req.originalUrl
            });

            // Check if user has any of the required roles
            const hasRequiredRole = roles.some(role => userRoles.includes(role));
            if (!hasRequiredRole) {
                logger.warn('Authorization failed: Insufficient permissions', {
                    userId,
                    requiredRoles: roles,
                    userRoles,
                    path: req.originalUrl
                });
                throw new Unauthorized('INSUFFICIENT_PERMISSIONS', AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS, AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS);
            }

            logger.info('Role check passed', { userId, path: req.originalUrl });
            next();
        } catch (error) {
            logger.error('Role check failed', { 
                error: error instanceof Error ? error.message : 'Unknown error',
                userId: req.userId,
                path: req.originalUrl
            });

            next(error);
        }
    };
};