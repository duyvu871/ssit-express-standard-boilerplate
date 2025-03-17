import AuthService from '../../../src/api/services/auth.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { RoleRepository } from '../../../src/repositories/role.repository';
import TokenService from '../../../src/api/services/token.service';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRole } from '../../../src/common/enums/models/user';
import Conflict from '../../../src/responses/client-errors/conflict';
import NotFound from '../../../src/responses/client-errors/not-found';
import Unauthorized from '../../../src/responses/client-errors/unauthorized';
import BadRequest from '../../../src/responses/client-errors/bad-request';

// Mock dependencies
jest.mock('../../../src/repositories/user.repository');
jest.mock('../../../src/repositories/role.repository');
jest.mock('../../../src/api/services/token.service');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
    let authService: AuthService;
    let mockUserRepository: jest.Mocked<UserRepository>;
    let mockRoleRepository: jest.Mocked<RoleRepository>;
    let mockTokenService: jest.Mocked<TokenService>;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Create mock instances
        mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
        mockRoleRepository = new RoleRepository() as jest.Mocked<RoleRepository>;
        mockTokenService = new TokenService() as jest.Mocked<TokenService>;

        // Create instance of service with mocked dependencies
        authService = new AuthService();
        
        // Replace the service's repository instances with our mocks
        (authService as any).userRepository = mockUserRepository;
        (authService as any).roleRepository = mockRoleRepository;
        (authService as any).tokenService = mockTokenService;
    });

    describe('register', () => {
        const userData = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'User'
        };

        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockRole = {
            id: 1,
            name: UserRole.USER,
            description: 'Regular user',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
        };

        it('should register a new user successfully', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockRoleRepository.findByName.mockResolvedValue(mockRole);
            mockUserRepository.transaction.mockImplementation(async (callback) => {
                return mockUser;
            });
            mockUserRepository.findWithRoles.mockResolvedValue([{
                ...mockUser,
                userRoles: [{
                    role: { name: UserRole.USER, id: 1 },
                    userId: 1,
                    roleId: 1,
                }]
            }]);
            mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

            // Act
            const result = await authService.register(userData);

            // Assert
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockRoleRepository.findByName).toHaveBeenCalledWith(UserRole.USER);
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, expect.any(Number));
            expect(mockUserRepository.transaction).toHaveBeenCalled();
            expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith(
                mockUser.id,
                mockUser.username,
                [UserRole.USER]
            );
            expect(result).toEqual({
                user: expect.objectContaining({
                    id: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email
                }),
                tokens: mockTokens
            });
        });

        it('should throw Conflict error when username already exists', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(authService.register(userData)).rejects.toThrow(Conflict);
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
            expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
        });

        it('should throw Conflict error when email already exists', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);

            // Act & Assert
            await expect(authService.register(userData)).rejects.toThrow(Conflict);
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockRoleRepository.findByName).not.toHaveBeenCalled();
        });

        it('should throw NotFound error when default role not found', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockRoleRepository.findByName.mockResolvedValue(null);

            // Act & Assert
            await expect(authService.register(userData)).rejects.toThrow(NotFound);
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(userData.username);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockRoleRepository.findByName).toHaveBeenCalledWith(UserRole.USER);
            expect(mockUserRepository.transaction).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const loginCredentials = {
            username: 'testuser',
            password: 'Password123!'
        };

        const mockUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockTokens = {
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: 3600
        };

        it('should login user successfully with username', async () => {
            // Arrange
            (authService as any).findUserByUsernameOrEmail = jest.fn().mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockUserRepository.findWithRoles.mockResolvedValue([{
                ...mockUser,
                userRoles: [{
                    role: { name: UserRole.USER, id: 1 },
                    userId: 1,
                    roleId: 1,
                }]
            }]);
            mockTokenService.generateAuthTokens.mockResolvedValue(mockTokens);
            (authService as any).logUserLogin = jest.fn().mockResolvedValue(undefined);

            // Act
            const result = await authService.login(loginCredentials.username, loginCredentials.password);

            // Assert
            expect(authService['findUserByUsernameOrEmail']).toHaveBeenCalledWith(loginCredentials.username);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginCredentials.password, mockUser.passwordHash);
            expect(mockUserRepository.findWithRoles).toHaveBeenCalled();
            expect(mockTokenService.generateAuthTokens).toHaveBeenCalledWith(
                mockUser.id,
                mockUser.username,
                [UserRole.USER]
            );
            expect(authService['logUserLogin']).toHaveBeenCalledWith(mockUser.id);
            expect(result).toEqual({
                user: expect.objectContaining({
                    id: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email
                }),
                tokens: mockTokens
            });
        });

        it('should throw Unauthorized error when user not found', async () => {
            // Arrange
            (authService as any).findUserByUsernameOrEmail = jest.fn().mockResolvedValue(null);

            // Act & Assert
            await expect(authService.login(loginCredentials.username, loginCredentials.password))
                .rejects.toThrow(Unauthorized);
            expect(authService['findUserByUsernameOrEmail']).toHaveBeenCalledWith(loginCredentials.username);
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should throw Unauthorized error when user is inactive', async () => {
            // Arrange
            const inactiveUser = { ...mockUser, isActive: false };
            (authService as any).findUserByUsernameOrEmail = jest.fn().mockResolvedValue(inactiveUser);

            // Act & Assert
            await expect(authService.login(loginCredentials.username, loginCredentials.password))
                .rejects.toThrow(Unauthorized);
            expect(authService['findUserByUsernameOrEmail']).toHaveBeenCalledWith(loginCredentials.username);
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should throw Unauthorized error when password is invalid', async () => {
            // Arrange
            (authService as any).findUserByUsernameOrEmail = jest.fn().mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            // Act & Assert
            await expect(authService.login(loginCredentials.username, loginCredentials.password))
                .rejects.toThrow(Unauthorized);
            expect(authService['findUserByUsernameOrEmail']).toHaveBeenCalledWith(loginCredentials.username);
            expect(bcrypt.compare).toHaveBeenCalledWith(loginCredentials.password, mockUser.passwordHash);
            expect(mockUserRepository.findWithRoles).not.toHaveBeenCalled();
        });
    });

    describe('refreshToken', () => {
        const mockRefreshToken = 'valid-refresh-token';
        const mockDecodedToken = {
            userId: 1,
            username: 'testuser',
            roles: [UserRole.USER]
        };

        const mockUser = {
            id: 1,
            username: 'testuser',
            isActive: true,
            passwordHash: 'hashed-password',
            email: 'EMAIL',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const mockTokens = {
            accessToken: 'new-access-token',
            refreshToken: 'new-refresh-token',
            expiresIn: 3600
        };

        it('should refresh tokens successfully', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
            mockUserRepository.findById.mockResolvedValue(mockUser);
            (authService as any).generateAuthTokens = jest.fn().mockResolvedValue(mockTokens);

            // Act
            const result = await authService.refreshToken(mockRefreshToken);

            // Assert
            expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
            expect(mockUserRepository.findById).toHaveBeenCalledWith(mockDecodedToken.userId);
            expect(authService['generateAuthTokens']).toHaveBeenCalledWith(
                mockUser.id,
                mockUser.username
            );
            expect(result).toEqual(mockTokens);
        });

        it('should throw Unauthorized error when refresh token is missing', async () => {
            // Act & Assert
            await expect(authService.refreshToken('')).rejects.toThrow(Unauthorized);
            expect(jwt.verify).not.toHaveBeenCalled();
        });

        it('should throw Unauthorized error when token verification fails', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            // Act & Assert
            await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
            expect(mockUserRepository.findById).not.toHaveBeenCalled();
        });

        it('should throw Unauthorized error when user not found or inactive', async () => {
            // Arrange
            (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);
            mockUserRepository.findById.mockResolvedValue(null);
            (authService as any).generateAuthTokens = jest.fn();

            // Act & Assert
            await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow(Unauthorized);
            expect(jwt.verify).toHaveBeenCalledWith(mockRefreshToken, expect.any(String));
            expect(mockUserRepository.findById).toHaveBeenCalledWith(mockDecodedToken.userId);
            expect(authService['generateAuthTokens']).not.toHaveBeenCalled();
        });
    });

    // Additional test cases
    
    describe('logout', () => {
        const mockRefreshToken = 'valid-refresh-token';
        const mockUserId = 1;
        
        it('should successfully logout user', async () => {
            // Arrange
            mockTokenService.verifyRefreshToken.mockResolvedValue({
                payload: { 
                    userId: mockUserId ,
                    username: 'testuser',
                    roles: [UserRole.USER]
                },
                scopes: ['USER']
            });
            mockTokenService.invalidateRefreshToken.mockResolvedValue(true);
            
            // Act
            await authService.logout(mockRefreshToken);
            
            // Assert
            expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
            expect(mockTokenService.invalidateRefreshToken).toHaveBeenCalledWith(mockRefreshToken, mockUserId);
        });
        
        it('should throw BadRequest error when refresh token is missing', async () => {
            // Act & Assert
            await expect(authService.logout('')).rejects.toThrow(BadRequest);
            expect(mockTokenService.verifyRefreshToken).not.toHaveBeenCalled();
        });
        
        it('should handle token verification failure gracefully', async () => {
            // Arrange
            mockTokenService.verifyRefreshToken.mockRejectedValue(new Unauthorized('INVALID_TOKEN', 'Invalid token', 'Invalid token'));
            
            // Act & Assert
            await expect(authService.logout(mockRefreshToken)).rejects.toThrow(Unauthorized);
            expect(mockTokenService.verifyRefreshToken).toHaveBeenCalledWith(mockRefreshToken);
            expect(mockTokenService.invalidateRefreshToken).not.toHaveBeenCalled();
        });
    });
    
    describe('findUserByUsernameOrEmail', () => {
        const username = 'testuser';
        const email = 'test@example.com';
        
        const mockUser = {
            id: 1,
            username,
            email,
            passwordHash: 'hashed_password',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        it('should find user by username', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(mockUser);
            
            // Act
            const result = await authService['findUserByUsernameOrEmail'](username);
            
            // Assert
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
            expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });
        
        it('should find user by email when username lookup fails', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(mockUser);
            
            // Act
            const result = await authService['findUserByUsernameOrEmail'](email);
            
            // Assert
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(email);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
            expect(result).toEqual(mockUser);
        });
        
        it('should return null when user not found by username or email', async () => {
            // Arrange
            mockUserRepository.findByUsername.mockResolvedValue(null);
            mockUserRepository.findByEmail.mockResolvedValue(null);
            
            // Act
            const result = await authService['findUserByUsernameOrEmail'](username);
            
            // Assert
            expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(username);
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(username);
            expect(result).toBeNull();
        });
    });
});