import prisma from './prisma';
import { Subscription, Prisma } from '@prisma/client';

export class SubscriptionRepository {
    /**
     * Create a new subscription
     * @param data Subscription data to create
     * @returns Created subscription
     */
    async create(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
        return prisma.subscription.create({
            data,
        });
    }

    /**
     * Find a subscription by ID
     * @param id Subscription ID
     * @returns Subscription or null if not found
     */
    async findById(id: number): Promise<Subscription | null> {
        return prisma.subscription.findUnique({
            where: { id },
        });
    }

    /**
     * Find subscriptions by user ID
     * @param userId User ID
     * @returns Array of subscriptions for the user
     */
    async findByUserId(userId: number): Promise<Subscription[]> {
        return prisma.subscription.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find active subscriptions by user ID
     * @param userId User ID
     * @returns Array of active subscriptions for the user
     */
    async findActiveByUserId(userId: number): Promise<Subscription[]> {
        return prisma.subscription.findMany({
            where: {
                userId,
                status: 'active',
                endDate: {
                    gte: new Date(),
                },
            },
            orderBy: {
                endDate: 'desc',
            },
        });
    }

    /**
     * Get all subscriptions with optional pagination
     * @param skip Number of records to skip
     * @param take Number of records to take
     * @returns Array of subscriptions
     */
    async findAll(skip?: number, take?: number): Promise<Subscription[]> {
        return prisma.subscription.findMany({
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find subscriptions by status
     * @param status Subscription status to filter by
     * @param skip Number of records to skip
     * @param take Number of records to take
     * @returns Array of subscriptions with the specified status
     */
    async findByStatus(status: string, skip?: number, take?: number): Promise<Subscription[]> {
        return prisma.subscription.findMany({
            where: { status },
            skip,
            take,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Find subscriptions that are about to expire
     * @param daysThreshold Number of days until expiration
     * @returns Array of subscriptions about to expire
     */
    async findAboutToExpire(daysThreshold: number): Promise<Subscription[]> {
        const today = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(today.getDate() + daysThreshold);

        return prisma.subscription.findMany({
            where: {
                status: 'active',
                endDate: {
                    gte: today,
                    lte: thresholdDate,
                },
            },
            include: {
                user: true,
            },
            orderBy: {
                endDate: 'asc',
            },
        });
    }

    /**
     * Update a subscription
     * @param id Subscription ID
     * @param data Subscription data to update
     * @returns Updated subscription
     */
    async update(id: number, data: Prisma.SubscriptionUpdateInput): Promise<Subscription> {
        return prisma.subscription.update({
            where: { id },
            data,
        });
    }

    /**
     * Cancel a subscription
     * @param id Subscription ID
     * @returns Cancelled subscription
     */
    async cancel(id: number): Promise<Subscription> {
        return prisma.subscription.update({
            where: { id },
            data: {
                status: 'cancelled',
                autoRenew: false,
            },
        });
    }

    /**
     * Renew a subscription
     * @param id Subscription ID
     * @param newEndDate New end date for the subscription
     * @returns Renewed subscription
     */
    async renew(id: number, newEndDate: Date): Promise<Subscription> {
        return prisma.subscription.update({
            where: { id },
            data: {
                status: 'active',
                startDate: new Date(),
                endDate: newEndDate,
                lastBillingDate: new Date(),
                nextBillingDate: newEndDate,
            },
        });
    }

    /**
     * Delete a subscription
     * @param id Subscription ID
     * @returns Deleted subscription
     */
    async delete(id: number): Promise<Subscription> {
        return prisma.subscription.delete({
            where: { id },
        });
    }

    /**
     * Count total subscriptions with optional filter
     * @param where Optional filter conditions
     * @returns Count of subscriptions
     */
    async count(where?: Prisma.SubscriptionWhereInput): Promise<number> {
        return prisma.subscription.count({ where });
    }

    /**
     * Execute operations in a transaction
     * @param fn Function containing transaction operations
     * @returns Result of the transaction
     */
    async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
        return prisma.$transaction(fn);
    }
}