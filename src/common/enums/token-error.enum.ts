/**
 * Enum for token validation error messages
 * Provides detailed error descriptions for token-related issues
 */
export enum TokenErrorMessage {
    // Token format errors
    INVALID_TOKEN_FORMAT = 'Token format is invalid',
    MALFORMED_TOKEN = 'Token is malformed or corrupted',
    
    // Token validation errors
    TOKEN_EXPIRED = 'Token has expired and is no longer valid',
    TOKEN_NOT_YET_VALID = 'Token is not yet valid (issued for future use)',
    INVALID_SIGNATURE = 'Token signature verification failed',
    
    // Token payload errors
    INVALID_PAYLOAD = 'Token payload is invalid or missing required fields',
    INVALID_USER_ID = 'User ID in token is invalid or missing',
    INVALID_USERNAME = 'Username in token is invalid or missing',
    INVALID_ROLES = 'User roles in token are invalid or missing',
    
    // Refresh token errors
    REFRESH_TOKEN_EXPIRED = 'Refresh token has expired',
    REFRESH_TOKEN_INVALID = 'Refresh token is invalid or has been revoked',
    REFRESH_TOKEN_REQUIRED = 'Refresh token is required',
    REFRESH_TOKEN_NOT_FOUND = 'Refresh token not found in database',
    
    // Device-related errors
    INVALID_DEVICE_ID = 'Device ID in token is invalid',
    DEVICE_MISMATCH = 'Device ID does not match the original token'
}