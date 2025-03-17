import * as path from 'node:path';
import config from 'server/configs/app.config';
import { AppLogger } from 'shared/logger';

const appLoggerPath = path.posix.join(process.cwd(), config.isDev ? 'logs/dev' : 'logs/prod');

const appLogger = new AppLogger(appLoggerPath);
const logger = appLogger.createLogger('app');

export {
	logger
};

export default logger;
