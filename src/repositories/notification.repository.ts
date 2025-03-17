import prisma from './prisma';
import { Notification, Prisma } from '@prisma/client';

export class NotificationRepository {
    /**
     * Create a new notification
     * @param data Notification data to create
     * @returns Created notification
     */
    async create(data: Prisma.NotificationCreateInput): Promise<Notification> {
        return prisma.notification.create({
            data,
        });
    }

    /**
     * Find a notification by ID
     * @param id Notification ID
     * @returns Notification or null if not found
     */
    async findById(id: number): Promise<Notification | null> {
        return prisma.notification.findUnique({
            where: { id },
        });
    }

    /**
     * Find notifications by user ID
     * @param userId User ID
     * @returns Array of notifications for the user
     */
    async findByUserId(userId: number): Promise<Notification[]> {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    /**
     * Mark a notification as read
     * @param id Notification ID
     * @returns Updated notification
     */
    async markAsRead(id: number): Promise<Notification> {
        return prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    /**
     * Delete a notification
     * @param id Notification ID
     * @returns Deleted notification
     */
    async delete(id: number): Promise<Notification> {
        return prisma.notification.delete({
            where: { id },
        });
    }

    /**
     * Count total notifications with optional filter
     * @param where Optional filter conditions
     * @returns Count of notifications
     */
    async count(where?: Prisma.NotificationWhereInput): Promise<number> {
        return prisma.notification.count({ where });
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