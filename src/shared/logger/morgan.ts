import morgan, {TokenIndexer} from 'morgan';
import { AppLogger } from './production';
import * as path from 'path';
import config from 'server/configs/app.config';

// Create a dedicated HTTP logger instance
const appLoggerPath = path.posix.join(process.cwd(), config.isDev ? 'logs/dev' : 'logs/prod');
const httpLogger = new AppLogger(appLoggerPath).createLogger('http');

// Create a context-specific child logger for HTTP requests
const requestLogger = httpLogger.child({ context: 'HTTP' });

/**
 * Morgan middleware that logs HTTP requests using our Winston logger
 * This integrates Morgan with our custom logger implementation
 */
export const morganMiddleware = morgan((tokens: TokenIndexer, req, res) => {
    // Skip logging for health check endpoints to reduce noise
    if (req.url && (req.url === '/health' || req.url === '/api/health')) {
        return null;
    }
    
    // Extract request data from Morgan tokens
    const logData = {
        method: tokens.method(req, res),
        url: tokens.url(req, res),
        status: parseInt(tokens.status(req, res) || '0'),
        response_time_ms: parseFloat(tokens['response-time'](req, res) || '0'),
        content_length: tokens.res(req, res, 'content-length') || '-',
        user_agent: tokens['user-agent'](req, res),
        remote_addr: tokens['remote-addr'](req, res),
        referrer: tokens.referrer(req, res),
        request_id: req.headers['x-request-id'] || '-'
    };

    // Create a formatted message for human readability
    const message = [
        logData.method,
        logData.url,
        logData.status,
        '-',
        `${logData.response_time_ms}ms`
    ].join(' ');

    // Determine log level based on status code
    let level = 'http';
    if (logData.status >= 500) {
        level = 'error';
    } else if (logData.status >= 400) {
        level = 'warn';
    }

    // Log with appropriate level and structured metadata
    requestLogger.log(level, message, {
        http: logData,
        request: {
            headers: filterSensitiveHeaders(req.headers),
            query: req.query,
            // Don't log sensitive body data
            body: req.method === 'POST' || req.method === 'PUT' ? '(request body omitted)' : undefined
        }
    });

    return null;
});

/**
 * Filter sensitive information from request headers
 * Removes or masks authentication tokens and other sensitive data
 * @param headers - The original request headers
 * @returns Filtered headers object with sensitive data removed or masked
 */
function filterSensitiveHeaders(headers: any): any {
    if (!headers) return {};
    
    // Create a copy of the headers to avoid modifying the original
    const filteredHeaders = { ...headers };
    
    // List of sensitive header keys to filter (case-insensitive)
    const sensitiveHeaders = [
        'authorization',
        'x-access-token',
        'x-refresh-token',
        'refresh-token',
        'access-token',
        'cookie',
        'set-cookie',
        'x-api-key',
        'api-key',
        'password',
        'secret',
        'token'
    ];
    
    // Filter out sensitive headers
    Object.keys(filteredHeaders).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveHeaders.some(h => lowerKey.includes(h))) {
            filteredHeaders[key] = '[REDACTED]';
        }
    });
    
    return filteredHeaders;
}