/**
 * Role and Permission-related enums based on the Prisma schema
 */

/**
 * Enum for common role types
 */
export enum RoleType {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

/**
 * Enum for permission types
 */
export enum PermissionType {
    // User management permissions
    USER_CREATE = 'user_create',
    USER_READ = 'user_read',
    USER_UPDATE = 'user_update',
    USER_DELETE = 'user_delete',

    // Content management permissions
    CONTENT_CREATE = 'content_create',
    CONTENT_READ = 'content_read',
    CONTENT_UPDATE = 'content_update',
    CONTENT_DELETE = 'content_delete',

    // System management permissions
    SYSTEM_SETTINGS = 'system_settings',
    SYSTEM_LOGS = 'system_logs',

    // Payment management permissions
    PAYMENT_READ = 'payment_read',
    PAYMENT_PROCESS = 'payment_process',
    PAYMENT_REFUND = 'payment_refund',

    // Subscription management permissions
    SUBSCRIPTION_CREATE = 'subscription_create',
    SUBSCRIPTION_READ = 'subscription_read',
    SUBSCRIPTION_UPDATE = 'subscription_update',
    SUBSCRIPTION_CANCEL = 'subscription_cancel'
}