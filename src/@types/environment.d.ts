import type { Express, Request } from 'express';

declare global {
	namespace NodeJS {
		interface ProcessEnv {
			NODE_ENV: 'development' | 'production' | 'test';
			HOST: string;
			DATABASE_URL: string;
			PORT?: string;
			SESSION_SECRET: string;
		}
	}
	namespace Express {
		export interface Request {
			// jwtPayload?: Record<string, any> & { id: string; type: 'MEMBERSHIP' | 'USER' | 'ADMIN' };
			file?: Express.Multer.File;
			image?: Express.Multer.File;
			userId?: string;
			username?: string;
			userRoles?: string[];
			deviceId?: string;
		}
	}
}
export {};