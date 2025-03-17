import SocketServer from 'loader/websocket.loader';
import RedisServer from 'loader/redis.loader';
import NotificationService from 'services/notification.service';
import { SocketEvent } from 'common/constants';

export class NotificationWebSocket {
    private socketServer: SocketServer;
    private redis: RedisServer;
    private notificationService: NotificationService;
    private redisChannel = 'notifications';

    constructor(socketServer: SocketServer, redis: RedisServer) {
        this.socketServer = socketServer;
        this.redis = redis;
        this.notificationService = new NotificationService();
        this.initialize();
    }

    private initialize(): void {
        // Setup Redis pub/sub
        const pubClient = this.redis.instance.duplicate();
        const subClient = this.redis.instance.duplicate();

        // Subscribe to Redis channel
        subClient.subscribe(this.redisChannel);

        // Handle new notifications from Redis
        subClient.on('message', (channel, message) => {
            if (channel === this.redisChannel) {
                const { userId, notification } = JSON.parse(message);
                this.socketServer.broadcastToRoom(`user_${userId}`, SocketEvent.NOTIFICATION, notification);
            }
        });

        // Setup socket listeners
        this.socketServer.instance.on(SocketEvent.CONNECT, (socket) => {
            // Join user-specific room
            socket.on(SocketEvent.JOIN_USER_ROOM, (userId: number) => {
                socket.join(`user_${userId}`);
            });

            // Mark notification as read
            socket.on(SocketEvent.MARK_READ, async (notificationId: number) => {
                await this.notificationService.markAsRead(notificationId);
            });
        });
    }

    public async publishNotification(userId: number, notification: any): Promise<void> {
        const pubClient = this.redis.instance.duplicate();
        await pubClient.publish(this.redisChannel, JSON.stringify({ userId, notification }));
    }
}