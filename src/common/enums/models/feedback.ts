/**
 * Feedback-related enums based on the Prisma schema
 */

/**
 * Enum for feedback categories
 */
export enum FeedbackCategory {
    PRODUCT = 'product',
    SERVICE = 'service',
    WEBSITE = 'website',
    APP = 'app',
    SUPPORT = 'support',
    OTHER = 'other'
}

/**
 * Enum for feedback statuses
 */
export enum FeedbackStatus {
    PENDING = 'pending',
    REVIEWED = 'reviewed',
    RESOLVED = 'resolved',
    REJECTED = 'rejected',
    IN_PROGRESS = 'in_progress'
}

/**
 * Enum for feedback rating levels
 */
export enum FeedbackRating {
    VERY_POOR = 1,
    POOR = 2,
    AVERAGE = 3,
    GOOD = 4,
    EXCELLENT = 5
}