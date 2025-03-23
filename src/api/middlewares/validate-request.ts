import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import BadRequest from 'responses/client-errors/bad-request';
import logger from 'util/logger';
import InternalServerError from 'responses/server-errors/internal-server-error';

type ValidateType = 'body' | 'headers' | 'query' | 'params';
type ValidatedData = Record<string, unknown>;

const validate = (type: ValidateType, ...schemas: ZodType<any>[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!schemas.length) return next();

			const rawData = req[type];
			let mergedData: ValidatedData = {};

			for (const schema of schemas) {
				const result = schema.safeParse(rawData);

				if (!result.success) {
					const errorMessages = result.error.errors.map((err) => {
						const path = err.path.join('.');
						const message = err.message;
						return `${path} (${type}): ${message}`;
					});

					throw new BadRequest(
						'VALIDATION_ERROR',
						'Invalid request data',
						errorMessages.join(', ')
					);
				}

				console.log(`req[${type}] validatedData: `, result.data);

				mergedData = { ...mergedData, ...result.data };
			}

			console.log(`req[${type}] validatedData: `, mergedData);

			req[type] = mergedData;
			next();
		} catch (error) {
			if (error instanceof BadRequest) {
				logger.warn(`Validation error [${type}]: ${error.message}`);
				return next(error);
			}

			if (error instanceof ZodError) {
                logger.warn(`Zod validation error [${type}]: ${error.errors.map((err) =>
					`${err.path.join('.')} (${type}): ${err.message}`
				).join(', ')}`);
				const errorMessages = error.errors.map((err) => err.message);

				const validationError = new BadRequest(
					'VALIDATION_ERROR',
					'Invalid request data',
					errorMessages.join(', ')
				);

				logger.warn(`Zod validation error [${type}]: ${validationError.message}`);
				return next(validationError);
			}

			logger.error('Unexpected validation error:', error);
			next(new InternalServerError(
				'INTERNAL_VALIDATION_ERROR',
				'Validation processing failed',
				'An unexpected error occurred during validation'
			));
		}
	};
};

// Type-safe factory functions
export const validateBody = (...schemas: ZodType<any>[]) => validate('body', ...schemas);
export const validateHeader = (...schemas: ZodType<any>[]) => validate('headers', ...schemas);
export const validateQuery = (...schemas: ZodType<any>[]) => validate('query', ...schemas);
export const validateParams = (...schemas: ZodType<any>[]) => validate('params', ...schemas);