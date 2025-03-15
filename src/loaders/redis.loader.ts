/**
 * @fileOverview This file defines the Redis server setup for the application.
 * It manages the connection to the Redis server, handles connection events, and provides methods for interacting with Redis.
 */

import Redis from 'ioredis';
import config from "server/configs/app.config";

/**
 * @class RedisServer
 * @classdesc Manages the Redis server connection. It encapsulates the connection logic and provides methods
 * for initializing the connection, getting values, closing the connection, and deleting session keys.
 */
class RedisServer {
    /**
     * @private
     * @property _redis
     * @type {Redis}
     * @description The Redis client instance.
     */
    private _redis!: Redis;
    /**
     * @private
     * @property _redisPort
     * @type {number}
     * @default config.redisPort
     * @description The port number for the Redis server, obtained from the application configuration.
     */
    private _redisPort: number = config.redisPort;

    /**
     * @async
     * @method initialize
     * @description Initializes the Redis connection. If a connection already exists, it returns the existing connection.
     * It also sets up event listeners for connection events, such as error and connect.
     * @returns {Promise<Redis>} The Redis client instance.
     */
    public async initialize(): Promise<Redis> {
        if (this._redis) {
            console.info(new Date(), '[Redis]: Already Started');
            return this._redis;
        }

        const redisOptions = {
            host: config.redisHost,
            port: config.redisPort,
        };

        this._redis = new Redis(redisOptions);

        this._redis.on('error', (err) => {
            console.error(new Date(), '[Redis]: Error connecting:', err);
        });

        this._redis.on('connect', () => {
            console.log('Running Redis Server on port %s', this._redisPort);
        });

        return this._redis;
    }

    /**
     * @async
     * @method getValueWithKey
     * @description Retrieves a value from Redis based on the provided key.
     * @param {string} key - The key to retrieve the value for.
     * @returns {Promise<string | null>} The value associated with the key, or null if the key does not exist or an error occurs.
     */
    public async getValueWithKey(key: string): Promise<string | null> {
        try {
            const value = await this._redis.get(key);
            return value;
        } catch (err) {
            console.error(new Date(), '[Redis]: Error getting value:', err);
            return null;
        }
    }

    /**
     * @async
     * @method close
     * @description Closes the Redis connection.
     * @returns {Promise<void>}
     */
    public async close(): Promise<void> {
        try {
            await this._redis.quit();
            console.info(new Date(), "[RedisServer]: Stopped");
        } catch (err) {
            console.error(new Date(), "[RedisServer]: Error stopping:", err);
        }
    }

    /**
     * @readonly
     * @property instance
     * @type {Redis}
     * @description Gets the Redis client instance.
     * @throws {Error} If the Redis client has not been initialized yet.
     */
    get instance(): Redis {
        if (!this._redis) {
            throw new Error("Redis not initialized. Call 'initialize' first.");
        }
        return this._redis;
    }

    /**
     * @async
     * @method deleteSessionKeys
     * @description Deletes keys from Redis based on a provided key pattern.
     * @param {string} keyPattern - The key pattern to match keys for deletion.
     * @returns {Promise<void>}
     */
    async deleteSessionKeys(keyPattern: string): Promise<void> {
        try {
            const keys = await this._redis.keys(keyPattern);
            if (keys.length > 0) {
                const deletedCount = await this._redis.eval(
                    "local count = 0; for _, key in ipairs(redis.call('keys', ARGV[1])) do redis.call('del', key); count = count + 1; end; return count;",
                    0,
                    keyPattern
                );
                console.log(`Deleted ${deletedCount} keys.`);
            } else {
                console.log('No keys found.');
            }
        } catch (error) {
            console.error(`Delete keys pattern ${keyPattern} error:`, error);
        }
    }
}

export default RedisServer;