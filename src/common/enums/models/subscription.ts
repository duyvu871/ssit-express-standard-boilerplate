/**
 * Subscription-related enums based on the Prisma schema
 */

/**
 * Enum for subscription types
 */
export enum SubscriptionType {
    BASIC = 'basic',
    PREMIUM = 'premium',
    ENTERPRISE = 'enterprise',
    FREE_TRIAL = 'free_trial'
}

/**
 * Enum for subscription statuses
 */
export enum SubscriptionStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    CANCELLED = 'cancelled',
    PENDING = 'pending',
    SUSPENDED = 'suspended'
}

/**
 * Enum for payment methods used in subscriptions
 */
export enum PaymentMethod {
    CREDIT_CARD = 'credit_card',
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer',
    CRYPTO = 'crypto',
    MOBILE_PAYMENT = 'mobile_payment'
}