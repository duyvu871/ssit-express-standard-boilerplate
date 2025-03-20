import { createLogger, format, transports, Logger, addColors } from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import os from 'os';

// Custom log levels with priorities
const LOG_LEVELS = {
	error: 0,
	warn: 1,
	alert: 2, // Custom level for important notifications
	info: 3,
	http: 4,
	debug: 5,
	silly: 6
};

// Custom colors for log levels
const LOG_COLORS = {
	error: 'red',
	warn: 'yellow',
	alert: 'magenta',
	info: 'green',
	http: 'cyan',
	debug: 'blue',
	silly: 'gray'
};

// Add custom colors to winston
addColors(LOG_COLORS);

export class AppLogger {
	// Clients for different log files
	public clients: Record<string, Logger> = {};

	// Private constructor to prevent instantiation
	constructor(private logPath: string) {
		if (!logPath) {
			throw new Error('Log path is required');
		}
	}

	/**
	 * Create and configure the logger
	 * @param logName - Name of the logger (used for file naming and identification)
	 * @param logPath - Optional custom path for log files
	 * @returns Configured Winston Logger instance
	 */
	public createLogger(logName: string, logPath?: string): Logger {
		if (!logName) {
			throw new Error('Log name is required');
		}
		
		// Destructure the format object
		const { combine, timestamp, printf, errors, json, splat, colorize, metadata } = format;

		// Common metadata for all logs
		const commonMetadata = format((info) => {
			info.service = logName;
			info.hostname = os.hostname();
			info.pid = process.pid;
			info.environment = process.env.NODE_ENV || 'development';
			return info;
		});

		// Define custom log format for console output
		const consoleFormat = printf(({ level, message, timestamp, stack, service, context, ...meta }) => {
			let logMessage = `${timestamp} ${level.toUpperCase()}`;
			
			if (service) {
				logMessage += ` [${service}]`;
			}
			
			if (context) {
				logMessage += ` [${context}]`;
			}
			
			logMessage += `: ${stack || message}`;
			
			logMessage += ` ${JSON.stringify(meta)}`;
			
			return logMessage;
		});

		// Create a new logger
		const logger = createLogger({
			// Use custom log levels
			levels: LOG_LEVELS,
			level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
			format: combine(
				timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
				errors({ stack: true }), // Log stack trace for errors
				commonMetadata(), // Add common metadata
				// splat(), // Add splat for printf
				// Using printf format instead of JSON for plain text output
				// printf(({ level, message, timestamp, stack, service, context, ...meta }) => {
				// 	let logMessage = `${timestamp} ${level.toUpperCase()}`;
					
				// 	if (service) {
				// 		logMessage += ` [${service}]`;
				// 	}
					
				// 	if (context) {
				// 		logMessage += ` [${context}]`;
				// 	}
					
				// 	logMessage += `: ${stack || message}`;
					
				// 	// Add metadata if present and not empty
				// 	const metaKeys = Object.keys(meta).filter(key => !['timestamp', 'level', 'message', 'stack'].includes(key));
				// 	if (metaKeys.length > 0) {
				// 		const metaData = {};
				// 		metaKeys.forEach(key => {
				// 			metaData[key] = meta[key];
				// 		});
				// 		logMessage += ` ${JSON.stringify(metaData)}`;
				// 	}
					
				// 	return logMessage;
				// })
			),
			transports: [
				// Console transport for all environments
				new transports.Console({
					format: combine(
						colorize({ all: true }),
						consoleFormat
					),
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

				// HTTP logs with context filtering
				new transports.DailyRotateFile({
					level: 'http',
					filename: path.join(this.logPath, 'http-%DATE%.log'),
					datePattern: 'YYYY-MM-DD',
					maxSize: '20m',
					maxFiles: '14d',
					zippedArchive: true,
					format: format.combine(
						format((info) => info.context === 'HTTP' ? info : false)(),
						// Using printf format instead of JSON for plain text output
						printf(({ level, message, timestamp, stack, service, context, ...meta }) => {
							let logMessage = `${timestamp} ${level.toUpperCase()}`;
							
							if (service) {
								logMessage += ` [service:${service}]`;
							}
							
							if (context) {
								logMessage += ` [context:${context}]`;
							}
							
							logMessage += `: ${stack || message}`;
							
							// // Add HTTP metadata if present
							// if (meta.http) {
							// 	logMessage += ` ${JSON.stringify(meta.http)}`;
							// }
							
							return logMessage;
						})
					)
				}),

				// Debug logs for development environment
				...(process.env.NODE_ENV !== 'production' ? [
					new transports.DailyRotateFile({
						level: 'debug',
						filename: path.join(this.logPath, 'debug-%DATE%.log'),
						datePattern: 'YYYY-MM-DD',
						maxSize: '20m',
						maxFiles: '7d',
						zippedArchive: true,
					})
				] : [])
			],
			exitOnError: false, // Prevent the app from crashing on an error
		});

		// Bind the logger to the current instance if it's not bound
		this.clients[logName] = logger;

		// Add custom methods to the logger for structured logging
		const enhancedLogger = logger as Logger & {
			childContext: (context: string) => Logger;
			logWithMeta: (level: string, message: string, meta?: Record<string, any>) => void;
			alert: (message: string, meta?: Record<string, any>) => void;
		};

		// Create a child logger with a specific context
		enhancedLogger.childContext = (context: string) => {
			return logger.child({ context });
		};

		// Log with metadata
		enhancedLogger.logWithMeta = (level: string, message: string, meta: Record<string, any> = {}) => {
			logger.log(level, message, { ...meta });
		};

		// Custom alert level method
		// @ts-ignore - Ignore the type error for the method
		enhancedLogger.alert = function(message: string, meta: Record<string, any> = {}): void {
			logger.log('alert', message, { ...meta });
		};

		return enhancedLogger;
	}
}

