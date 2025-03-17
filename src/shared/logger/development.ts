import { createLogger, format, transports, Logger } from "winston";
import "winston-daily-rotate-file";
import path from 'path';

export class DevelopmentLogger {
	private static instance: Logger;

	private constructor() { }

	// Method to get the instance of Logger (Singleton)
	public static getInstance(): Logger {
		if (!DevelopmentLogger.instance) {
			DevelopmentLogger.instance = DevelopmentLogger.createLogger();
		}
		return DevelopmentLogger.instance;
	}

	// Create a logger with specific configurations
	private static createLogger(): Logger {
		const logFormat = format.printf(
			({ level, message, timestamp, stack, meta }) =>
				`${timestamp} [${level.toUpperCase()}]: ${stack || message} ${meta ? JSON.stringify(meta) : ''}`
		);

		return createLogger({
			level: "debug", // Set level to debug to capture all log levels
			format: format.combine(
				format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				format.errors({ stack: true }),
				format.splat(),
				format.metadata(), // Add metadata to the log info
				format.json(),
				format.colorize(),
				logFormat
			),
			transports: [
				// Log to console
				new transports.Console(),

				// Log to file for all levels
				new transports.DailyRotateFile({
					level: "info",
					filename: path.join("logs", "dev", "app", "application-%DATE%.log"),
					datePattern: "YYYY-MM-DD",
					maxSize: "20m",
					maxFiles: "14d",
				}),

				// Log errors (level: error) to a separate file
				new transports.DailyRotateFile({
					level: "error",
					filename: path.join("logs", "dev", "error-%DATE%.log"),
					datePattern: "YYYY-MM-DD",
					maxSize: "20m",
					maxFiles: "30d",
				}),

				// HTTP logs
				new transports.DailyRotateFile({
					filename: path.join("logs", "dev", "http", "http-%DATE%.log"),
					level: 'http',
					format: format.combine(
						format((info) => info.context === 'HTTP' ? info : false)(),
						format.printf(({ timestamp, level, message, meta }) => {
							return `${timestamp} [${level}] ${message} ${meta ? JSON.stringify(meta) : ''}`;
						})
					)
				}),

				// Debug logs - add proper debug transport
				new transports.DailyRotateFile({
					level: "debug",
					filename: path.join("logs", "dev", "debug-%DATE%.log"),
					datePattern: "YYYY-MM-DD",
					maxSize: "20m",
					maxFiles: "7d",
					zippedArchive: true,
				})
			],
			exitOnError: false, // Do not exit the program on error
		});
	}
}
