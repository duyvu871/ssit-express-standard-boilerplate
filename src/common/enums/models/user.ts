/**
 * User-related enums based on the Prisma schema
 */

/**
 * Enum for user roles in the system
 */
export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
    MODERATOR = 'moderator',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

/**
 * Enum for user activity types
 */
export enum ActivityType {
    PAGE_VIEW = 'page_view',
    BUTTON_CLICK = 'button_click',
    FORM_SUBMIT = 'form_submit',
    LOGIN = 'login',
    LOGOUT = 'logout',
    PROFILE_UPDATE = 'profile_update',
    PASSWORD_CHANGE = 'password_change',
    SUBSCRIPTION_CHANGE = 'subscription_change',
    PAYMENT = 'payment'
}

/**
 * Enum for notification types
 */
export enum NotificationType {
    SYSTEM = 'system',
    ALERT = 'alert',
    MESSAGE = 'message',
    PAYMENT = 'payment',
    SUBSCRIPTION = 'subscription'
}

/**
 * Enum for user gender options
 */
export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}