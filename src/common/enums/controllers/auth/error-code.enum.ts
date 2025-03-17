/**
 * Enum for authentication controller error codes
 * Provides standardized error codes for the auth controller
 */
export enum AuthControllerErrorCode {
    // Profile access errors
    USER_ID_REQUIRED = 'USER_ID_REQUIRED',
    
    // Password change errors
    PASSWORD_CHANGE_FAILED = 'PASSWORD_CHANGE_FAILED',
    
    // Password reset errors
    PASSWORD_RESET_REQUEST_FAILED = 'PASSWORD_RESET_REQUEST_FAILED',
    PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED'
}