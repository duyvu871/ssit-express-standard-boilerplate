// Mock app configuration for testing

export default {
    isDev: false,
    serverPort: 8080,
    defaultExpire: 3600,
    assetsUrl: 'http://localhost:8080/storage',
    baseUrl: 'http://localhost:8080',
    redis: {
        port: 6379,
        host: 'redis',
    },
    mongodb: {
        uri: 'mongodb://localhost:27017/mongo',
    },
    postgres: {
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: 'postgres',
        database: 'postgres',
    },
    session: {
        expire: 24 * 60 * 60,
        secret: 'secret',
    },
    refreshToken: {
        expire: 7 * 24 * 60 * 60,
        secret: 'refresh_secret',
    },
    jwt: {
        accessSecret: 'test-access-secret-key',
        refreshSecret: 'test-refresh-secret-key',
        accessExpiry: '15m',
        refreshExpiry: '7d',
    },
};