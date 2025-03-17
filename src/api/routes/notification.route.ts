import { Router } from "express";
import { NotificationRepository } from "repository/notification.repository";

const notificationRouter = Router();
const notificationRepo = new NotificationRepository();

notificationRouter.get('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const notifications = await notificationRepo.findByUserId(userId);
        res.render('notification', {
            title: 'Notifications',
            notifications: notifications.map(n => ({
                ...n,
                createdAt: new Date(n.createdAt).toLocaleString()
            }))
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.render('notification', {
            title: 'Notifications',
            notifications: [],
            error: 'Failed to load notifications'
        });
    }
});

notificationRouter.get('/', (req, res) => {
    res.render('home', {
        title: 'Welcome',
        notification: req.query.message
    });
});

export default notificationRouter;