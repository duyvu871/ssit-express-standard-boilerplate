import { createLogger, format, transports, Logger } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

export class AppLogger {
	// Clients for different log files
	public clients: Record<string, Logger> = {};

	// Private constructor to prevent instantiation
	constructor(private logPath: string) {
		if (!logPath) {
			throw new Error('Log path is required');
		}
	}

	// Create and configure the logger
	public createLogger(logName: string, logPath?: string): Logger {
		if (!logName) {
			throw new Error('Log name is required');
		}
		// Destructure the format object
		const { combine, timestamp, printf, errors, json, splat, colorize } = format;

		// Define custom log format
		const logFormat = printf(({ level, message, timestamp, stack }) => {
			return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
		});

		// Create a new logger
		const logger = createLogger({
			level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
			format: combine(
				timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				errors({ stack: true }), // Log stack trace for errors
				json(),
				colorize(),
				splat(),
				logFormat
			),
			transports: [
				// Console transport for development
				new transports.Console({
					format: combine(colorize(), logFormat),
				}),

				// Daily file rotation for general logs
				new transports.DailyRotateFile({
					level: 'info',
					filename: path.join(logPath || path.join(this.logPath, `/${logName}`), 'application-%DATE%.log'),
					datePattern: 'YYYY-MM-DD',
					maxSize: '20m',
					maxFiles: '14d',
					zippedArchive: true,
				}),

				// Separate log file for errors
				new transports.DailyRotateFile({
					level: 'error',
					filename: path.join(this.logPath, 'error-%DATE%.log'),
					datePattern: 'YYYY-MM-DD',
					maxSize: '20m',
					maxFiles: '30d',
					zippedArchive: true,
				}),
				new transports.DailyRotateFile({
					filename: "logs/http-%DATE%.log",
					// ... các config khác giữ nguyên
					format: format.combine(
						format((info) => info.context === 'HTTP' ? info : false)(),
						format.printf(({ timestamp, level, message, meta }) => {
							return `${timestamp} [${level}] ${message} ${JSON.stringify(meta)}`;
						})
					)
				})
			],
			exitOnError: false, // Prevent the app from crashing on an error
		});

		// Bind the logger to the current instance if it's not bound
		this.clients[logName] = logger;

		return logger;
	}
}

