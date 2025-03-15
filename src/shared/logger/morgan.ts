import morgan, {TokenIndexer} from 'morgan';
import { DevelopmentLogger } from './development';

export const morganMiddleware = morgan((tokens: TokenIndexer, req, res) => {
    const logger = DevelopmentLogger.getInstance();

    const logData = {
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: tokens.status(req, res),
        response_time: tokens['response-time'](req, res) + 'ms',
        user_agent: tokens['user-agent'](req, res),
        remote_addr: tokens['remote-addr'](req, res)
    };

    const message = [
        logData.method,
        logData.url,
        logData.status,
        '-',
        logData.response_time
    ].join(' ');

    logger.info(message, { http: logData });

    return null;
});