/**
 * @fileOverview This file defines the Socket.IO server setup for the application.
 * It manages the Socket.IO server instance, handles client connections and disconnections,
 * and provides methods for broadcasting events to clients and managing rooms.
 */

import * as SocketIo from 'socket.io';
import { Server } from 'http';

import { SocketEvent } from 'common/constants';
// import LiveBitcoinWebsocket from "../websockets/LiveBitcoinWebsocket";
import RedisServer from "loader/redis.loader";
import { NotificationWebSocket } from 'websockets/notification.socket';

/**
 * @class SocketServer
 * @classdesc Manages the Socket.IO server. It handles client connections, disconnections,
 * broadcasting events, and managing rooms.
 */
class SocketServer {
    /**
     * @private
     * @property _io
     * @type {SocketIo.Server}
     * @description The Socket.IO server instance.
     */
    private _io: SocketIo.Server;
    /**
     * @private
     * @property _redis
     * @type {RedisServer}
     * @description The Redis server instance for storing socket related data.
     */
    private _redis: RedisServer;
    /**
     * @private
     * @property _clients
     * @type {Map<string, SocketIo.Socket>}
     * @description A map to store connected socket clients, with socket ID as the key and Socket object as the value.
     */
    private _clients: Map<string, SocketIo.Socket> = new Map();
    /**
     * @private
     * @property _slaveNamespaces
     * @type {Map<string, SocketIo.Namespace>}
     * @description A map to store slave namespaces, with server ID as the key and Namespace object as the value.
     */
    private _slaveNamespaces: Map<string, SocketIo.Namespace> = new Map();

    /**
     * @constructor
     * @param {Server} server - The HTTP server instance to attach Socket.IO to.
     * @param {RedisServer} redis - The Redis server instance for storing socket related data.
     * @description Initializes the SocketServer with the HTTP server and Redis server instances, configures CORS,
     * sets the socket path, and starts listening for connections.
     */
    constructor(server: Server, redis: RedisServer) {
        this._io = new SocketIo.Server(server, {
            cors: {
                origin: "*",
                methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            },
            path: '/socket',
        });
        this._redis = redis;
        this.listen();
        new NotificationWebSocket(this, redis);
        // new LiveBitcoinWebsocket(this, this._redis).initialize();
    }

    /**
     * @private
     * @method listen
     * @description Listens for incoming socket connections and handles connection and disconnection events.
     * Stores socket clients in a Map and removes them on disconnect.
     */
    private listen(): void {
        this._io
            .on(SocketEvent.CONNECT, async (socket) => {
                try {
                    // Store socket client in Map
                    const socketId: string = socket.id;
                    this._clients.set(socketId, socket);

                    // Remove socket ID from Map on disconnect
                    socket.on(SocketEvent.DISCONNECT, async () => {
                        try {
                            this._clients.delete(socketId);
                        } catch (error) {
                            console.error("Error removing key from Redis on disconnect:", error);
                        }
                    });
                } catch (error) {
                    console.error("Error storing socket ID in Redis:", error);
                    socket.disconnect(); // Disconnect if Redis operation fails
                }
            });

        if (this._io) {
            console.log('Running Socket Server is listening.');
        }
    }

    /**
     * @async
     * @method close
     * @description Closes the Socket.IO server.
     * @returns {Promise<void>}
     */
    public async close(): Promise<void> {
        try {
            //  io.close() handles closing connections
            await new Promise<void>((resolve, reject) => {
                this._io.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.info(new Date(), "[SocketServer]: Stopped");
                        resolve();
                    }
                });
            });
        } catch (err) {
            console.error(new Date(), "[SocketServer]: Error stopping:", err);
        }
    }

    /**
     * @readonly
     * @property instance
     * @type {SocketIo.Server}
     * @description Gets the Socket.IO server instance.
     */
    get instance(): SocketIo.Server {
        return this._io;
    }

    /**
     * @readonly
     * @property clients
     * @type {Map<string, SocketIo.Socket>}
     * @description Gets the map of connected socket clients.
     */
    get clients(): Map<string, SocketIo.Socket> {
        return this._clients;
    }

    /**
     * @method setClient
     * @param {string} socketId - The ID of the socket.
     * @param {SocketIo.Socket} socket - The Socket.IO socket instance.
     * @description Sets a socket client in the clients map.
     */
    setClient(socketId: string, socket: SocketIo.Socket): void {
        this._clients.set(socketId, socket);
    }

    /**
     * @method getClient
     * @param {string} socketId - The ID of the socket to retrieve.
     * @returns {SocketIo.Socket | undefined} The Socket.IO socket instance, or undefined if not found.
     * @description Gets a socket client from the clients map.
     */
    getClient(socketId: string): SocketIo.Socket | undefined {
        return this._clients.get(socketId);
    }

    /**
     * @method destroyClient
     * @param {string} socketId - The ID of the socket to remove.
     * @description Removes a socket client from the clients map.
     */
    destroyClient(socketId: string): void {
        this._clients.delete(socketId);
    }

    /**
     * @method getManyClients
     * @param {string[]} socketIds - An array of socket IDs to retrieve.
     * @returns {(SocketIo.Socket | undefined)[]} An array of Socket.IO socket instances, or undefined if not found.
     * @description Gets multiple socket clients from the clients map.
     */
    getManyClients(socketIds: string[]): (SocketIo.Socket | undefined)[] {
        return socketIds.map((id) => this._clients.get(id));
    }

    /**
     * @method broadcast
     * @param {string} event - The event name to broadcast.
     * @param {any} data - The data to send with the event.
     * @description Broadcasts an event to all connected clients.
     */
    broadcast(event: string, data: any): void {
        this._io.emit(event, data);
    }

    /**
     * @method broadcastToRoom
     * @param {string} room - The room to broadcast the event to.
     * @param {string} event - The event name to broadcast.
     * @param {any} data - The data to send with the event.
     * @description Broadcasts an event to all clients in a specific room.
     */
    broadcastToRoom(room: string, event: string, data: any): void {
        this._io.to(room).emit(event, data);
    }

    /**
     * @method joinRoom
     * @param {string} socketId - The ID of the socket to add to the room.
     * @param {string} room - The name of the room to join.
     * @description Adds a socket to a specific room.
     */
    joinRoom(socketId: string, room: string): void {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.join(room);
        }
    }

    /**
     * @method leaveRoom
     * @param {string} socketId - The ID of the socket to remove from the room.
     * @param {string} room - The name of the room to leave.
     * @description Removes a socket from a specific room.
     */
    leaveRoom(socketId: string, room: string): void {
        const socket = this.getClient(socketId);
        if (socket) {
            socket.leave(room);
        }
    }

    /**
     * @method getSlaveNamespace
     * @param {string} serverId - The ID of the server to get the namespace for.
     * @returns {SocketIo.Namespace | undefined} The Socket.IO namespace instance, or undefined if not found.
     * @description Gets a slave namespace by server ID.
     */
    getSlaveNamespace(serverId: string): SocketIo.Namespace | undefined {
        return this._slaveNamespaces.get(serverId);
    }

    /**
     * @method addSlaveNamespace
     * @param {string} serverId - The ID of the server to add the namespace for.
     * @param {SocketIo.Namespace} server - The Socket.IO namespace instance.
     * @description Adds a slave namespace to the map.
     */
    addSlaveNamespace(serverId: string, server: SocketIo.Namespace): void {
        this._slaveNamespaces.set(serverId, server);
    }

    /**
     * @method removeSlaveNamespace
     * @param {string} serverId - The ID of the server to remove the namespace for.
     * @description Removes a slave namespace from the map.
     */
    removeSlaveNamespace(serverId: string): void {
        this._slaveNamespaces.delete(serverId);
    }
}

export default SocketServer;