import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Unauthorized from 'responses/client-errors/unauthorized';
import { AuthMiddlewareErrorMessage } from 'common/enums/auth-middleware-error.enum';
import { TokenErrorMessage } from 'common/enums/token-error.enum';
import TokenService from 'services/token.service';
import { tokenValidation } from 'validations/token.validation';

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
        // Get the authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            throw new Unauthorized('AUTH_HEADER_REQUIRED', AuthMiddlewareErrorMessage.AUTH_HEADER_REQUIRED, AuthMiddlewareErrorMessage.AUTH_HEADER_REQUIRED);
        }

        // Check if the header format is valid
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            throw new Unauthorized('INVALID_AUTH_FORMAT', AuthMiddlewareErrorMessage.INVALID_AUTH_FORMAT, AuthMiddlewareErrorMessage.INVALID_AUTH_FORMAT);
        }

        const token = parts[1];
        if (!token) {
            throw new Unauthorized('TOKEN_REQUIRED', AuthMiddlewareErrorMessage.TOKEN_REQUIRED, AuthMiddlewareErrorMessage.TOKEN_REQUIRED);
        }

        // Use TokenService to verify the token
        const tokenService = new TokenService();
        const decoded = tokenService.verifyAccessToken(token);

        // Validate decoded token using Zod schema
        const validationResult = tokenValidation.decodedToken.safeParse(decoded);
        if (!validationResult.success) {
            throw new Unauthorized('INVALID_TOKEN_FORMAT', TokenErrorMessage.INVALID_TOKEN_FORMAT, validationResult.error.message);
        }

        const validatedToken = validationResult.data;

        // Validate token expiration
        if (Date.now() >= validatedToken.exp) {
            throw new Unauthorized('EXPIRED_TOKEN', TokenErrorMessage.TOKEN_EXPIRED, TokenErrorMessage.TOKEN_EXPIRED);
        }

        // Validate token not-before time
        if (validatedToken.nbf && Date.now() < validatedToken.nbf) {
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

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new Unauthorized('INVALID_TOKEN', TokenErrorMessage.INVALID_SIGNATURE, TokenErrorMessage.INVALID_SIGNATURE));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new Unauthorized('TOKEN_EXPIRED', TokenErrorMessage.TOKEN_EXPIRED, TokenErrorMessage.TOKEN_EXPIRED));
        } else {
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

            // Check if user has any of the required roles
            const hasRequiredRole = roles.some(role => userRoles.includes(role));
            if (!hasRequiredRole) {
                throw new Unauthorized('INSUFFICIENT_PERMISSIONS', AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS, AuthMiddlewareErrorMessage.INSUFFICIENT_PERMISSIONS);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};