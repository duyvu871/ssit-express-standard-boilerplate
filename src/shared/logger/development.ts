import { createLogger, format, transports, Logger } from "winston";
import "winston-daily-rotate-file";

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
			({ level, message, timestamp, stack }) =>
				`${timestamp} [${level.toUpperCase()}]: ${stack || message}`
		);

		return createLogger({
			level: "info",
			format: format.combine(
				format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
				format.errors({ stack: true }),
				format.splat(),
				format.json(),
				format.colorize(),
				logFormat
			),
			transports: [
				// Log to console
				new transports.Console(),

				// Log to file for all levels
				new transports.DailyRotateFile({
					filename: "logs/application-%DATE%.log",
					datePattern: "YYYY-MM-DD",
					maxSize: "20m",
					maxFiles: "14d",
				}),

				// Log errors (level: error) to a separate file
				new transports.DailyRotateFile({
					level: "error",
					filename: "logs/error-%DATE%.log",
					datePattern: "YYYY-MM-DD",
					maxSize: "20m",
					maxFiles: "30d",
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
			exitOnError: false, // Do not exit the program on error
		});
	}
}
