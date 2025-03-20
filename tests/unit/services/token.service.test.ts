import TokenService, { TokenType, VerifyTokenStatus } from '../../../src/api/services/token.service';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../src/repositories/prisma';
import Unauthorized from '../../../src/responses/client-errors/unauthorized';
import BadRequest from '../../../src/responses/client-errors/bad-request';
import appConfig from '../../../src/configs/app.config';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('uuid');
jest.mock('../../../src/repositories/prisma', () => ({
    __esModule: true,
    default: {
        refreshToken: {
            create: jest.fn(),
            findFirst: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
        $transaction: jest.fn((callback) => callback(prisma)),
    },
}));

describe('TokenService', () => {
    let tokenService: TokenService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Mock UUID generation to return predictable values
        (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');

        // Create instance of service
        tokenService = new TokenService();
    });

    describe('generateAuthTokens', () => {
        const userId = 1;
        const username = 'testuser';
        const roles = ['USER'];
        const deviceId = 'test-device';

        const mockAccessToken = 'mock-access-token';
        const mockRefreshToken = 'mock-refresh-token';

        beforeEach(() => {
            // Mock JWT sign to return predictable tokens
            (jwt.sign as jest.Mock).mockImplementation((payload, secret, options) => {
                // Check if this is for access token or refresh token based on the payload
                if (secret === appConfig.jwtAccessSecret) {
                    return mockAccessToken;
                } else {
                    return mockRefreshToken;
                }
            });

            // Mock Date.now to return a fixed timestamp
            jest.spyOn(Date, 'now').mockReturnValue(1600000000000); // Fixed timestamp
        });

        it('should generate access and refresh tokens', async () => {
            // Arrange
            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 1,
                token: mockRefreshToken,
                userId,
                expiresAt: new Date(),
                createdAt: new Date(),
            });

            // Act
            const result = await tokenService.generateAuthTokens(userId, username, roles);

            // Assert
            expect(jwt.sign).toHaveBeenCalledTimes(2);
            expect(prisma.refreshToken.create).toHaveBeenCalledWith({
                data: {
                    token: expect.any(String),
                    userId,
                    expiresAt: expect.any(Date)
                }
            });
            expect(result).toEqual({
                accessToken: mockAccessToken,
                refreshToken: mockRefreshToken,
                expiresIn: expect.any(Number),
            });
        });

        it('should use provided deviceId when available', async () => {
            // Arrange
            (prisma.refreshToken.create as jest.Mock).mockResolvedValue({
                id: 1,
                token: mockRefreshToken,
                userId,
                expiresAt: new Date(),
                createdAt: new Date(),
            });

            // Act
            await tokenService.generateAuthTokens(userId, username, roles, deviceId);

            // Assert
            expect(jwt.sign).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: expect.objectContaining({
                        deviceId,
                    }),
                }),
                expect.any(String),
                expect.any(Object)
            );
        });
    });

    describe('verifyAccessToken', () => {
        const mockToken = 'valid-access-token';
        const mockDecodedToken = {
            payload: {
                userId: 1,
                username: 'testuser',
                roles: ['USER'],
            },
            iat: 1600000000000,
            exp: 1600000900000,
            aud: '1',
            jti: 'mock-uuid',
            sub: 'testuser',
            nbf: 1600000000000,
            scopes: ['USER'],
        };

        it('should return decoded token when token is valid', () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

            // Act
            const result = tokenService.verifyAccessToken(mockToken);

            // Assert
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtAccessSecret, {"algorithms": ["HS256"], "ignoreNotBefore": true});
            expect(result).toEqual(mockDecodedToken);
        });

        it('should throw Unauthorized error when token is expired', () => {
            // Arrange
            const tokenExpiredError = new Error('jwt expired');
            (tokenExpiredError as any).name = 'TokenExpiredError';
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw tokenExpiredError;
            });

            // Act & Assert
            expect(() => tokenService.verifyAccessToken(mockToken)).toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtAccessSecret, {"algorithms": ["HS256"], "ignoreNotBefore": true});
        });

        it('should throw Unauthorized error when token signature is invalid', () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('invalid signature');
            });

            // Act & Assert
            expect(() => tokenService.verifyAccessToken(mockToken)).toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtAccessSecret, {"algorithms": ["HS256"], "ignoreNotBefore": true});
        });
    });

    describe('verifyRefreshToken', () => {
        const mockToken = 'valid-refresh-token';
        const mockDecodedToken = {
            payload: {
                userId: 1,
                username: 'testuser',
                roles: ['USER'],
            },
            iat: 1600000000000,
            exp: 1600604800000, // 7 days later
            aud: '1',
            jti: 'mock-uuid',
            sub: 'testuser',
            nbf: 1600000000000,
            scopes: ['USER'],
        };
        // Mock token hash that would be created by crypto.createHash('sha256').update(token).digest('hex')
        const mockTokenHash = 'ba518c093e1e0df01cfe01436563cd37f6a1f47697fcc620e818a2d062665083';

        // Mock crypto module
        jest.mock('crypto', () => ({
            createHash: jest.fn().mockReturnValue({
                update: jest.fn().mockReturnValue({
                    digest: jest.fn().mockReturnValue(mockTokenHash)
                })
            })
        }));

        it('should return decoded token when token is valid and exists in database', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
            (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                token: mockTokenHash, // Use the hashed token value
                userId: 1,
                expiresAt: new Date(1600604800000),
                createdAt: new Date(),
            });

            // Act
            const result = await tokenService.verifyRefreshToken(mockToken);

            // Assert
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtRefreshSecret);
            expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
                where: { token: mockTokenHash, userId: 1 }, // Expect the hashed token
            });
            expect(result).toEqual(mockDecodedToken);
        });

        it('should throw Unauthorized error when token is not found in database', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
            (prisma.refreshToken.findFirst as jest.Mock).mockResolvedValue(null);

            // Act & Assert
            await expect(tokenService.verifyRefreshToken(mockToken)).rejects.toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtRefreshSecret);
            expect(prisma.refreshToken.findFirst).toHaveBeenCalledWith({
                where: { token: mockTokenHash, userId: 1 },
            });
        });

        it('should throw Unauthorized error when token is expired', async () => {
            // Arrange
            const tokenExpiredError = new Error('jwt expired');
            (tokenExpiredError as any).name = 'TokenExpiredError';
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw tokenExpiredError;
            });

            // Act & Assert
            await expect(tokenService.verifyRefreshToken(mockToken)).rejects.toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockToken, appConfig.jwtRefreshSecret);
        });
    });
});