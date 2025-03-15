/**
 * Payment-related enums based on the Prisma schema
 */

/**
 * Enum for payment statuses
 */
export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
    PROCESSING = 'processing'
}

/**
 * Enum for payment currencies
 */
export enum Currency {
    USD = 'USD',
    EUR = 'EUR',
    GBP = 'GBP',
    JPY = 'JPY',
    CAD = 'CAD',
    AUD = 'AUD',
    CNY = 'CNY',
    VND = 'VND'
}

/**
 * Enum for payment providers
 */
export enum PaymentProvider {
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    SQUARE = 'square',
    BRAINTREE = 'braintree',
    ADYEN = 'adyen',
    MOMO = 'momo',
    VNPAY = 'vnpay'
}