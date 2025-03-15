/**
 * Enum for authentication service error messages
 */
export enum AuthServiceErrorMessage {
    // Login/credentials errors
    INVALID_CREDENTIALS = 'Invalid credentials',
    ACCOUNT_DISABLED = 'Account is disabled',
    
    // Token errors
    REFRESH_TOKEN_REQUIRED = 'Refresh token is required',
    INVALID_REFRESH_TOKEN = 'Invalid refresh token',
    
    // Password errors
    CURRENT_PASSWORD_REQUIRED = 'Current password is required',
    NEW_PASSWORD_REQUIRED = 'New password is required',
    PASSWORDS_MATCH = 'New password must be different from current password',
    CURRENT_PASSWORD_INCORRECT = 'Current password is incorrect',
    
    // Reset password errors
    RESET_TOKEN_REQUIRED = 'Reset token is required',
    INVALID_RESET_TOKEN = 'Invalid or expired token'
}