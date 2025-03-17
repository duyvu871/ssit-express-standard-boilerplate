/**
 * Enum for authentication controller error messages
 * Provides standardized error messages for the auth controller
 */
export enum AuthControllerErrorMessage {
    // Profile access errors
    USER_ID_REQUIRED = 'User ID is required for profile access',
    
    // Password change errors
    PASSWORD_CHANGE_FAILED = 'Failed to change password',
    
    // Password reset errors
    PASSWORD_RESET_REQUEST_FAILED = 'Failed to request password reset',
    PASSWORD_RESET_FAILED = 'Failed to reset password'
}