/**
 * @fileOverview This file is the main entry point for loading and initializing the application's core components.
 * It sets up the Express server, Redis server, Socket.IO server, MongoDB connection, and registers process event listeners for graceful shutdown.
 */

import ExpressServer from 'loader/express.loader';
import RedisServer from 'loader/redis.loader';
import SocketServer from 'loader/websocket.loader';
import DatabaseSeeder from 'loader/database-seeder.loader';
import logger from 'server/shared/utils/logger';
import { MinioLoader } from 'loader/minio.loader';


/**
 * @function
 * @async
 * @description Initializes and starts the core components of the application.
 * This includes:
 *  - Starting the Express server.
 *  - Initializing and connecting to the Redis server.
 *  - Starting the Socket.IO server and integrating it with Express and Redis.
 *  - Creating indexes for ProductSearch and RegionSearch services.
 *  - Registering event listeners for process exit signals to ensure graceful shutdown.
 */
export default async () => {
    // Initialize database with essential data
    try {
        const databaseSeeder = new DatabaseSeeder();
        await databaseSeeder.initialize();
        logger.info('Database seeding completed successfully');
    } catch (error) {
        logger.error('Error during database seeding:', error);
    }

    // initialize minio
    const minioClient = new MinioLoader();
    await minioClient.initialize();

    // start express
    const expressServer = new ExpressServer();
    const expressInstance = expressServer.server;

    // start redis
    const redisServer = new RedisServer();
    const redisInstance = await redisServer.initialize();
    expressServer.initRedis(redisServer);

    // start socket 
    const socketServer = new SocketServer(expressInstance, redisServer);
    const socketInstance = socketServer.instance;
    expressServer.initSocket(socketInstance);

    // const cronjob = new CronJob(socketServer, redisServer);
    // cronjob.initialize();

    // await ProductSearch.createIndex();
    // await RegionSearch.createIndexing();

    /**
     * @description Registers event listeners for 'exit' and 'SIGINT' signals to handle graceful shutdown.
     * On receiving either of these signals, the application will close the Express server, Redis connection,
     * Socket.IO server, connection before exiting.
     */
    process.on('exit', () => {
        expressServer.close();
        redisServer.close();
        socketServer.close();
    }).on('SIGINT', () => {
        expressServer.close();
        redisServer.close();
        socketServer.close();
    });
}