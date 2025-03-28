import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { IDecodedToken } from 'common/interfaces/jsonwebtoken';
import prisma from 'repository/prisma';
import crypto from "crypto"
import { v4 as uuidv4 } from 'uuid';
import Unauthorized from 'responses/client-errors/unauthorized';
import BadRequest from 'responses/client-errors/bad-request';
import { TokenErrorMessage } from 'common/enums/token-error.enum';
import appConfig from 'config/app-config';

// Token types
export enum TokenType {
    ACCESS = 'access',
    REFRESH = 'refresh',
    RESET = 'reset'
}

// Token verification status
export enum VerifyTokenStatus {
    SUCCESS = 'success',
    TOKEN_EXPIRED = 'token_expired',
    ACCESS_TOKEN_NOTFOUND = 'access_token_notfound',
    SIGNATURE_VERIFICATION_FAILURE = 'signature_verification_failure'
}

// Token payload interface
export interface TokenPayloadData {
    userId: number;
    username: string;
    roles: string[];
    deviceId?: string; // Device identifier for multi-device support
}

// Auth tokens interface
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

/**
 * Service for handling JWT token operations
 */
export default class TokenService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExpiry: string;
    private readonly refreshTokenExpiry: string;

    constructor() {
        this.accessTokenSecret = appConfig.jwtAccessSecret;
        this.refreshTokenSecret = appConfig.jwtRefreshSecret;
        this.accessTokenExpiry = appConfig.jwtAccessExpiry;
        this.refreshTokenExpiry = appConfig.jwtRefreshExpiry;
    }

    /**
     * Generate auth tokens for a user
     * @param userId User ID
     * @param username Username
     * @param roles User roles
     * @param deviceId Optional device identifier for multi-device support
     * @returns Access token and refresh token
     */
    async generateAuthTokens(userId: number, username: string, roles: string[], deviceId?: string): Promise<AuthTokens> {
        // Create token payload
        const payload: TokenPayloadData = {
            userId,
            username,
            roles,
            deviceId: deviceId || uuidv4() // Generate a device ID if not provided
        };

        // Generate JWT ID for token uniqueness
        const jti = uuidv4();

        // Create token data with standard JWT claims
        const tokenData: IDecodedToken<TokenPayloadData> = {
            payload,
            iat: Date.now(),
            exp: this.getExpiryTimestamp(this.accessTokenExpiry),
            aud: userId.toString(),
            jti,
            sub: username,
            // Set nbf to 5 seconds in the past to avoid clock skew issues
            nbf: Date.now() - 5000,
            scopes: roles
        };

        // Generate access token
        const accessToken = jwt.sign(tokenData, this.accessTokenSecret, { algorithm: 'HS256' });

        // Create refresh token data
        const refreshTokenData = {
            ...tokenData,
            exp: this.getExpiryTimestamp(this.refreshTokenExpiry)
        };

        // Generate refresh token
        const refreshToken = jwt.sign(refreshTokenData, this.refreshTokenSecret, { algorithm: 'HS256' });

        // Store refresh token in database
        await this.saveRefreshToken(userId, refreshToken, refreshTokenData.exp);

        // Parse expiry time from access token expiry string
        const expiresIn = this.parseExpiryTime(this.accessTokenExpiry);

        return {
            accessToken,
            refreshToken,
            expiresIn,
        };
    }

    /**
     * Verify access token
     * @param token Access token to verify
     * @returns Decoded token payload if valid
     */
    verifyAccessToken(token: string): IDecodedToken<TokenPayloadData> {
        try {
            // return jwt.verify(token, this.accessTokenSecret, { algorithms: ["HS256"] }) as IDecodedToken<TokenPayloadData>;
            return jwt.verify(token, this.accessTokenSecret, { 
                algorithms: ["HS256"],
                ignoreNotBefore: true // Ignore the nbf claim to prevent NotBeforeError
            }) as IDecodedToken<TokenPayloadData>;
        } catch (error) {
            console.log("verifyAccessToken error:", error);
            
            if (error instanceof TokenExpiredError) {
                throw new Unauthorized(
                    'TOKEN_EXPIRED',
                    TokenErrorMessage.TOKEN_EXPIRED,
                    TokenErrorMessage.TOKEN_EXPIRED
                );
            } else if (error instanceof jwt.JsonWebTokenError) {
                // Handle specific JsonWebTokenError (malformed, invalid signature, etc.)
                throw new Unauthorized(
                    'INVALID_TOKEN',
                    TokenErrorMessage.INVALID_SIGNATURE,
                    error.message || TokenErrorMessage.INVALID_SIGNATURE
                );
            } else {
                // Handle any other unexpected errors
                throw new Unauthorized(
                    'INVALID_TOKEN',
                    TokenErrorMessage.MALFORMED_TOKEN,
                    error instanceof Error ? error.message : TokenErrorMessage.MALFORMED_TOKEN
                );
            }
        }
    }

    /**
     * Verify refresh token
     * @param token Refresh token to verify
     * @returns Decoded token payload if valid
     */
    async verifyRefreshToken(token: string): Promise<IDecodedToken<TokenPayloadData>> {
        try {
            // Verify token signature
            const decoded = jwt.verify(token, this.refreshTokenSecret) as IDecodedToken<TokenPayloadData>;
            
            // Validate decoded token payload
            if (!decoded || !decoded.payload || !decoded.payload.userId) {
                throw new Unauthorized(
                    'INVALID_REFRESH_TOKEN',
                    TokenErrorMessage.INVALID_PAYLOAD,
                    TokenErrorMessage.INVALID_PAYLOAD
                );
            }
            
            // Create a hash of the token to match what's stored in the database
            const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
            
            // Check if token exists in database using the hash
            const storedToken = await prisma.refreshToken.findFirst({
                where: {
                    token: tokenHash,
                    userId: decoded.payload.userId
                }
            });

            if (!storedToken) {
                throw new Unauthorized(
                    'INVALID_REFRESH_TOKEN',
                    TokenErrorMessage.REFRESH_TOKEN_INVALID,
                    TokenErrorMessage.REFRESH_TOKEN_INVALID
                );
            }

            return decoded;
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                throw new Unauthorized(
                    'REFRESH_TOKEN_EXPIRED',
                    TokenErrorMessage.REFRESH_TOKEN_EXPIRED,
                    TokenErrorMessage.REFRESH_TOKEN_EXPIRED
                );
            }
            throw new Unauthorized(
                'INVALID_REFRESH_TOKEN',
                TokenErrorMessage.REFRESH_TOKEN_INVALID,
                TokenErrorMessage.REFRESH_TOKEN_INVALID
            );
        }
    }

    /**
     * Refresh access token using refresh token
     * @param refreshToken Refresh token
     * @returns New auth tokens
     */
    async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
        if (!refreshToken) {
            throw new BadRequest(
                'REFRESH_TOKEN_REQUIRED',
                'Refresh token is required',
                'Refresh token is required'
            );
        }

        // Verify refresh token
        const decoded = await this.verifyRefreshToken(refreshToken);

        // Check if user exists
        const user = await prisma.user.findUnique({
            // @ts-ignore decoded.payload.userId is number
            where: { id: decoded.payload.userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!user || !user.isActive) {
            throw new Unauthorized(
                'INVALID_USER',
                'User not found or inactive',
                'User not found or inactive'
            );
        }

        // Extract roles
        const roles = user.userRoles.map(ur => ur.role.name);

        // Generate new tokens, preserving the device ID
        return this.generateAuthTokens(
            user.id, 
            user.username, 
            roles, 
            // @ts-ignore decoded.payload.deviceId is string
            decoded.payload.deviceId
        );
    }

    /**
     * Invalidate a refresh token (logout)
     * @param refreshToken Refresh token to invalidate
     * @param userId Optional user ID for direct token invalidation without verification
     * @returns True if the operation was successful
     */
    async invalidateRefreshToken(refreshToken: string, userId?: number): Promise<boolean> {
        if (!refreshToken) {
            throw new BadRequest(
                'REFRESH_TOKEN_REQUIRED',
                'Refresh token is required',
                'Refresh token is required'
            );
        }

        try {
            // Create a hash of the token to match what's stored in the database
            const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
            
            // If userId is provided, use it directly
            if (userId) {
                await prisma.refreshToken.deleteMany({
                    where: {
                        token: tokenHash,
                        userId: userId
                    }
                });
            } else {
                // Otherwise verify token to get user ID
                const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as IDecodedToken<TokenPayloadData>;
                
                // Delete the token from database
                await prisma.refreshToken.deleteMany({
                    where: {
                        token: tokenHash,
                        // @ts-ignore decoded.payload.userId is number
                        userId: decoded.payload.userId
                    }
                });
            }
            return true;
        } catch (error) {
            // Ignore errors, as we're logging out anyway
            return false;
        }
    }

    /**
     * Invalidate all refresh tokens for a user (logout from all devices)
     * @param userId User ID
     */
    async invalidateAllUserTokens(userId: number): Promise<void> {
        await prisma.refreshToken.deleteMany({
            where: {
                userId
            }
        });
    }

    /**
     * Generate a password reset token
     * @param userId User ID
     * @returns Reset token
     */
    generateResetToken(userId: number): string {
        const payload = { userId };
        return jwt.sign(payload, this.accessTokenSecret, { expiresIn: '1h' });
    }

    /**
     * Verify a password reset token
     * @param token Reset token
     * @returns User ID if token is valid
     */
    verifyResetToken(token: string): number {
        try {
            const decoded = jwt.verify(token, this.accessTokenSecret) as { userId: number };
            return decoded.userId;
        } catch (error) {
            throw new Unauthorized(
                'INVALID_RESET_TOKEN',
                'Invalid or expired reset token',
                'Invalid or expired reset token'
            );
        }
    }

    /**
     * Save refresh token to database
     * @param userId User ID
     * @param token Refresh token
     * @param expiresAt Expiration timestamp
     * @private
     */
    private async saveRefreshToken(userId: number, token: string, expiresAt: number): Promise<void> {
        // Create a hash of the token to store in the database
        // This ensures the token value fits within the VARCHAR(255) column
        const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
        
        // Delete any existing tokens with the same token hash (shouldn't happen, but just in case)
        await prisma.refreshToken.deleteMany({
            where: {
                token: tokenHash
            }
        });

        // Create new refresh token record with the hash
        await prisma.refreshToken.create({
            data: {
                userId,
                token: tokenHash,
                expiresAt: new Date(expiresAt)
            }
        });
    }

    /**
     * Get expiry timestamp from expiry string
     * @param expiryString Expiry string (e.g., '15m', '1h', '7d')
     * @returns Expiry timestamp in milliseconds
     * @private
     */
    private getExpiryTimestamp(expiryString: string): number {
        const seconds = this.parseExpiryTime(expiryString);
        return Date.now() + (seconds * 1000);
    }

    /**
     * Parse expiry time from string (e.g., '15m', '1h', '7d')
     * @param expiryString Expiry time string
     * @returns Expiry time in seconds
     * @private
     */
    public parseExpiryTime(expiryString: string): number {
        const unit = expiryString.charAt(expiryString.length - 1);
        const value = parseInt(expiryString.slice(0, -1), 10);

        switch (unit) {
            case 's':
                return value;
            case 'm':
                return value * 60;
            case 'h':
                return value * 60 * 60;
            case 'd':
                return value * 24 * 60 * 60;
            default:
                return 900; // Default to 15 minutes (900 seconds)
        }
    }
}