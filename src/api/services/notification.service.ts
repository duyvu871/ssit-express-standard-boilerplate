import prisma from "repository/prisma"
import { ServiceResponse } from "responses/services-response/base";

export default class NotificationService {
    async createNotification(userId: number, type: string, title: string, content: string): Promise<ServiceResponse> {
        try {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    content,
                    isRead: false
                }
            });
            return { success: true, data: notification };
        } catch (error) {
            return { success: false, error: 'Failed to create notification' };
        }
    }

    async markAsRead(notificationId: number): Promise<ServiceResponse> {
        try {
            const notification = await prisma.notification.update({
                where: { id: notificationId },
                data: { isRead: true, readAt: new Date() }
            });
            return { success: true, data: notification };
        } catch (error) {
            return { success: false, error: 'Failed to mark notification as read' };
        }
    }

    async getUserNotifications(userId: number): Promise<ServiceResponse> {
        try {
            const notifications = await prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            return { success: true, data: notifications };
        } catch (error) {
            return { success: false, error: 'Failed to fetch notifications' };
        }
    }
}