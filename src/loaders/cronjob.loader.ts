/**
 * @fileOverview This file defines the CronJob class, which is responsible for scheduling and managing cron jobs within the application.
 * It uses the 'node-cron' library to schedule tasks, and it integrates with the RedisServer and SocketServer to perform tasks such as fetching and emitting live Bitcoin data.
 */

import cron from "node-cron"
import {CronStringConverter, TimeInterval} from "util/cron";
import RedisServer from "loader/redis.loader";
import SocketServer from "loader/websocket.loader";

/**
 * @class CronJob
 * @classdesc Manages cron jobs for the application. It handles scheduling tasks, stopping tasks, and registering process event listeners for graceful shutdown.
 */
class CronJob {
    /**
     * @private
     * @property _io
     * @type {SocketServer}
     * @description The SocketServer instance for emitting data to clients.
     */
    private _io: SocketServer;
    /**
     * @private
     * @property _redis
     * @type {RedisServer}
     * @description The RedisServer instance for storing and retrieving data.
     */
    private _redis: RedisServer;
    private _cronLabel: TimeInterval[] = [];
    private _cronUpdateInterval: TimeInterval;
    private _availableIntervals: TimeInterval[];
    /**
     * @private
     * @property _cronJobs
     * @type {Map<string, cron.ScheduledTask>}
     * @description A map to store the scheduled cron jobs, with a unique key for each job.
     */
    private _cronJobs: Map<string, cron.ScheduledTask> = new Map();
    /**
     * @constructor
     * @param {SocketServer} _io - The SocketServer instance.
     * @param {RedisServer} _redis - The RedisServer instance.
     * @description Initializes the CronJob with the SocketServer and RedisServer instances.
     */
    constructor(_io: SocketServer, _redis: RedisServer) {
        this._io = _io;
        this._redis = _redis;
        this._cronLabel = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M'];
        this._availableIntervals = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d'];
        this._cronUpdateInterval = '1s';
    }

    /**
     * @method initialize
     * @description Initializes the cron job scheduler. It registers process event listeners for graceful shutdown.
     * @returns {void}
     */
    public initialize(): void {
        // this.registerLiveBitcoinCron();
        const exitSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'] as const;
        exitSignals.forEach(signal => {
            process.on(signal, () => {
                this.stopCronJobs();
                process.exit(); // Ensure the process actually exits
            });
        });
        process.on('exit', () => {
            this.stopCronJobs();
        })
    }

    // public async registerLiveBitcoinCron(): Promise<void> {
    //     await this._redis.deleteSessionKeys('session:*');
    //
    //     const liveBitcoinService = new LiveBitcoinService(this._io.instance, this._redis);
    //     const liveSessionService = new LiveSessionService(this._io.instance, this._redis, 'BTCUSDT');
    //     const liveBitcoinNameSpace = this._io.getSlaveNamespace(LiveBitcoinWebsocket.name);
    //
    //     console.log('Registering Live Bitcoin Cron Jobs');
    //     const labels = this._cronLabel;
    //
    //     for (const label of labels) {
    //         const cronString = convertCronString(label);
    //         console.log(`Registering cron job for ${label} with cron string: ${cronString}`);
    //         // add cron job to map
    //         this._cronJobs.set(
    //             `getBTCUSDT:${label}`,
    //             cron.schedule(cronString, async (now) => {
    //                 try {
    //                     console.log(`Running a task every ${label}, time: ${now}`);
    //                     const currentSymbolTicker = await liveBitcoinService.getCurrentBinancePrice('BTCUSDT', label);
    //                     const normalizedData = liveBitcoinService.normalizeBinanceTicker(currentSymbolTicker);
    //                     await liveSessionService.updateSessionData(
    //                         label,
    //                         'BTCUSDT',
    //                         String(currentSymbolTicker.openTime),
    //                         normalizedData);
    //
    //                     // Fourier Transform
    //                     const candleData = await liveBitcoinService.getHistoricalClient({
    //                         symbol: 'BTCUSDT' as string,
    //                         interval: label as BinanceHistoricalArgs["interval"],
    //                         limit: 2000,
    //                     });
    //                     const fourierReadableData = candleData.map((item) =>
    //                         parseFloat(String(item.close)));
    //                     const fourierTransform = liveBitcoinService.fourierTransform(fourierReadableData);
    //                     const fourierTransformData = fourierTransform.map((item, index) => ({
    //                         data: item,
    //                         time: candleData[index].time,
    //                     }));
    //
    //                     liveBitcoinNameSpace && liveBitcoinNameSpace.to(`BTCUSDT:${label}`).emit(`fourier:${label}`, fourierTransformData);
    //                     console.log(`Emitting fourier:${label} to BTCUSDT:${label}`);
    //                 } catch (error) {
    //                     console.error('Error in Live Bitcoin Cron Job', error);
    //                 }
    //             })
    //         );
    //     }
    //
    //     const historicalPromises = [];
    //     for (const label of labels) {
    //         historicalPromises.push(
    //             liveBitcoinService.getBinanceHistorical({symbol: 'BTCUSDT', interval: label, limit: 2000})
    //         );
    //     }
    //
    //     const historicalData = await Promise.all(historicalPromises);
    //
    //     const savePromises: Promise<void>[] = [];
    //     for (const [index, data] of historicalData.entries()) {
    //         const normalizedData = liveBitcoinService.normalizeHistoricalBinanceData(data);
    //         const noDuplication = new Map<number, NormalizeHistorical[number]>(); // Remove duplication
    //         normalizedData.forEach((item) => {
    //             noDuplication.set(item.time, item);
    //         });
    //         const historicalDataFlatten = Array.from(noDuplication.values());
    //         savePromises.push(
    //             liveSessionService.saveMultipleKeys(labels[index], 'BTCUSDT', historicalDataFlatten)
    //         );
    //     }
    //     // Save all historical data to Redis
    //     await Promise.all(savePromises);
    //
    //     this._cronJobs.set(
    //         `updateBTCUSDT}`,
    //         cron.schedule(convertCronString(this._cronUpdateInterval), async (now) => {
    //             try {
    //                 console.log(`Running a task every ${this._cronUpdateInterval}, time: ${now}`);
    //                 const fetchingTickers = [];
    //                 const availableIntervals = this._availableIntervals;
    //                 for (const label of availableIntervals) {
    //                     fetchingTickers.push(
    //                         liveBitcoinService.getCurrentBinancePrice('BTCUSDT', label)
    //                     );
    //                 }
    //                 await Promise.all(fetchingTickers).then(tickers => {
    //                     tickers.forEach((currentSymbolTicker, index) => {
    //                         // console.log('currentSymbolTicker', currentSymbolTicker.lastPrice);
    //                         // console.log('liveBitcoinNameSpace', LiveBitcoinService.name);
    //                         try {
    //                             liveBitcoinNameSpace && liveBitcoinNameSpace.to(`BTCUSDT:${labels[index]}`).emit(`liveBitcoin:${labels[index]}`, {
    //                                 data: [
    //                                     currentSymbolTicker.openPrice,
    //                                     currentSymbolTicker.highPrice,
    //                                     currentSymbolTicker.lowPrice,
    //                                     currentSymbolTicker.lastPrice
    //                                 ].map(parseFloat),
    //                                 time: currentSymbolTicker.openTime,
    //                                 close: currentSymbolTicker.closeTime,
    //                             });
    //                             console.log(`Emitting liveBitcoin:${labels[index]} to BTCUSDT:${labels[index]}`);
    //                         } catch (e: any) {
    //                             console.error('Error in Live Bitcoin Cron Job', e);
    //                         }
    //                     });
    //                 });
    //             } catch (error) {
    //                 console.error('Error in Live Bitcoin Cron Job', error);
    //             }
    //         })
    //     );
    // }

    /**
     * @method stopCronJobs
     * @description Stops all running cron jobs.
     */
    stopCronJobs() {
        console.log('Stopping all cron jobs...');
        this._cronJobs.forEach((cron, key) => {
            console.log(`closed cron with key ${key}`);
            cron.stop();
        })
    }
}

export default CronJob;