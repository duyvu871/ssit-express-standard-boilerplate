/**
 * Enum for authentication error messages
 */
export enum AuthErrorMessage {
    // Authentication header errors
    AUTH_HEADER_REQUIRED = 'Authorization header is required',
    INVALID_AUTH_FORMAT = 'Invalid authorization format',
    TOKEN_REQUIRED = 'Token is required',
    
    // Token validation errors
    INVALID_TOKEN = 'Invalid token',
    TOKEN_EXPIRED = 'Token expired',
    
    // Permission errors
    INSUFFICIENT_PERMISSIONS = 'Insufficient permissions'
}