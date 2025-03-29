/**
 * @fileOverview This file defines the Express server setup for the application.
 * It configures the Express app with middleware, routes, and error handling.
 */

import express from 'express';
import * as bodyParser from "body-parser";
import config from "server/configs/app.config";
import cors from 'cors';
import cookieParser from "cookie-parser";
import errorHandler from "responses/error-handler.ts";
import route from 'server/api/routes';
import routeNotFound from 'middlewares/route-not-found';
import { morganMiddleware } from "logger/morgan";
import { setupSwagger } from 'middlewares/swagger.middleware';

import * as SocketIo from 'socket.io';
import { Server, createServer } from 'http';
import RedisServer from "loader/redis.loader";
import { engine } from 'express-handlebars';
import path from 'path/posix';


/**
 * @class ExpressServer
 * @classdesc Configures and starts the Express server, including middleware, routes, and error handling.
 */
class ExpressServer {
    /**
     * @static
     * @readonly
     * @type {number}
     * @description The default port number for the Express server.
     */
    public static readonly PORT: number = 8080;

    private _app!: express.Express;
    private _server!: Server;
    private _port!: number;

    /**
     * @constructor
     * @description Initializes the Express server and starts listening for incoming requests.
     */
    public constructor() {
        this.listen();
    }

    /**
     * @private
     * @function listen
     * @description Configures the Express app with middleware, routes, and error handling, then starts the server.
     */
    private listen(): void {

        // initialize express instances 
        this._app = express();

        // Enable Cross-Origin Resource Sharing (CORS)
        this._app.use(cors());

        // Parse Cookie headers
        this._app.use(cookieParser());

        // Apply Morgan middleware for logging HTTP requests
        this._app.use(morganMiddleware);
        this._app.engine('handlebars', engine({
            defaultLayout: 'main',
            layoutsDir: path.join(process.cwd(), 'src/views/layouts'),
            partialsDir: path.join(process.cwd(), 'src/views/partials'),
        }));
        this._app.set('view engine', 'handlebars');
        this._app.set('views', path.join(process.cwd(), 'src/views'));

        // static for ssr
        this._app.use('/statics/script', express.static(path.join(process.cwd(),'src/views/scripts')));
        this._app.use('/statics/style', express.static(path.join(process.cwd(), 'src/views/styles')));
        // Serve static files from the 'statics' directory
        this._app.use('/statics', express.static('statics'));
        // Serve static files from the 'storage' directory
        this._app.use('/storage', express.static('storage'));

        // Parse incoming request bodies in different formats
        this._app.use(bodyParser.text());
        this._app.use(bodyParser.urlencoded({ extended: true }));
        this._app.use(bodyParser.json({ limit: '10mb' }));

        // Mount API and page routes
        this._app.use('/api/v1', route.apiRoutes);
        this._app.use('/', route.pageRoutes);

        // Handle undefined routes (404)
        this._app.use('*', routeNotFound);

        // Setup Swagger documentation
        setupSwagger(this._app);

        // Apply global error handling middleware
        this._app.use(errorHandler);

        // start nodejs server
        this._port = config.serverPort || ExpressServer.PORT;
        this._server = createServer(this._app);
        this._server.listen(this._port, () => {
            console.log('Running Express Server on port %s', this._port);
        })
    }

    /**
     * @function close
     * @description Closes the Express server.
     */
    public close(): void {
        this._server.close((err) => {
            if (err) throw Error();

            console.info(new Date(), '[ExpressServer]: Stopped');
        });
    }

    /**
     * @function initSocket
     * @description Initializes the Socket.IO server and attaches it to the Express app.
     * @param {SocketIo.Server} socket - The Socket.IO server instance.
     */
    public initSocket(socket: SocketIo.Server): void {
        this._app.set('socket', socket);
    }

    /**
     * @function initRedis
     * @description Initializes the Redis server and attaches it to the Express app.
     * @param {RedisServer} redis - The Redis server instance.
     */
    public initRedis(redis: RedisServer): void {
        this._app.set('redis', redis);
    }

    /**
     * @getter server
     * @returns {Server} The underlying HTTP server instance.
     */
    get server(): Server { return this._server; }
}

export default ExpressServer;