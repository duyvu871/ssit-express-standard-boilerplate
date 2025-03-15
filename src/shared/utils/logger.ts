import * as path from 'node:path';
import config from 'config/app-config';
import { AppLogger } from '../logger';

const appLoggerPath = path.posix.join(process.cwd(), config.isDev ? 'logs/dev' : 'logs/prod');

const logger = new AppLogger(appLoggerPath);
const appLogger = logger.createLogger('app');

export {
	appLogger
};

export default appLogger;
