import * as dotenv from "dotenv";
import { resolve, join } from "path";
import * as process from "process";

// Skip .env file loading in test environment
if (process.env.NODE_ENV !== 'test') {
    const ENV_FILE_PATH = join(process.cwd(), process.env.NODE_ENV === "production" ? ".env" : ".env.local");
    const isEnvFound = dotenv.config({ path: ENV_FILE_PATH });
    if (isEnvFound.error) {
        throw new Error(`Cannot find ${process.env.NODE_ENV === "production" ? ".env" : ".env.local"} file.`);
    }
} else {
    console.info(new Date(), '[ExpressServer]: Skipped loading .env file in test environment');
}


// Assign default value for each environments
process.env.NODE_ENV = process.env.NODE_ENV || "development";
process.env.SERVER_PORT = process.env.SERVER_PORT || "8080";
process.env.DEFAULT_EXPIRE = process.env.DEFAULT_EXPIRE || "3600"; // 1 hour
process.env.ASSETS_URL = process.env.ASSETS_URL || "http://localhost:8080/storage";
process.env.BASE_URL = process.env.BASE_URL || "http://localhost:8080";
process.env.MINIO_URL = process.env.MINIO_URL || "http://localhost:9000";
// redis
process.env.REDIS_PORT = process.env.REDIS_PORT || "6379";
process.env.REDIS_HOST = process.env.REDIS_HOST || "redis";

// mongodb
process.env.DB_MONGO_URI = process.env.DB_MONGO_URI || "mongodb://localhost:27017/mongo";

// postgres database
process.env.DB_POSTGRES_HOST = process.env.DB_POSTGRES_HOST || "localhost";
process.env.DB_POSTGRES_PORT = process.env.DB_POSTGRES_PORT || "5432";
process.env.DB_POSTGRES_USER = process.env.DB_POSTGRES_USER || "postgres";
process.env.DB_POSTGRES_PASSWORD = process.env.DB_POSTGRES_PASSWORD || "postgres";
process.env.DB_POSTGRES_DATABASE = process.env.DB_POSTGRES_DATABASE || "postgres";

// session
process.env.AUTH_SESSION_EXPIRE = process.env.AUTH_SESSION_EXPIRE || (24 * 60 * 60).toString(); // 1 day
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "secret";
// refresh token
process.env.AUTH_REFRESH_EXPIRE = process.env.AUTH_REFRESH_EXPIRE || (7 * 24 * 60 * 60).toString(); // 1 week
process.env.REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secret";

// JWT configuration
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "access-secret-key";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret-key";
process.env.JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || "15m"; // 15 minutes
process.env.JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || "7d"; // 7 days


const config = {
    // express server port
    isDev: process.env.NODE_ENV === "development",
    serverPort: parseInt(process.env.SERVER_PORT, 10),
    defaultExpire: parseInt(process.env.DEFAULT_EXPIRE, 10),
    assetsUrl: process.env.ASSETS_URL,
    baseUrl: process.env.BASE_URL,
    // minio configuration
    minioUrl: process.env.MINIO_URL,
    minioAccessKey: process.env.MINIO_ACCESS_KEY,
    minioSecretKey: process.env.MINIO_SECRET_KEY,
    // redis port
    redisPort: parseInt(process.env.REDIS_PORT, 10),
    redisHost: process.env.REDIS_HOST,

    // mongodb
    mongoUri: process.env.DB_MONGO_URI,

    // postgres database
    dbHost: process.env.DB_POSTGRES_HOST,
    dbPort: parseInt(process.env.DB_POSTGRES_PORT, 10),
    dbUser: process.env.DB_POSTGRES_USER,
    dbPass: process.env.DB_POSTGRES_PASSWORD,
    dbName: process.env.DB_POSTGRES_DATABASE,

    // session expire time
    sessionExpire: parseInt(process.env.AUTH_SESSION_EXPIRE, 10),
    sessionSecret: process.env.SESSION_SECRET,
    // refresh token
    refreshExpire: parseInt(process.env.AUTH_REFRESH_EXPIRE, 10),
    refreshSecret: process.env.REFRESH_SECRET,
    
    // JWT configuration
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiry: process.env.JWT_ACCESS_EXPIRY,
    jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY
};

console.log('config', config);

export default config;