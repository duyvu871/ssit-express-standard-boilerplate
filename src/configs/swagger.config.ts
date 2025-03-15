import { Options } from 'swagger-jsdoc';
import config from 'config/app.config';

/**
 * Swagger configuration options
 */
const swaggerOptions: Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SSIT Standard Express API',
            version: '1.0.0',
            description: 'A robust, production-ready Express.js server API with TypeScript, Prisma ORM, and comprehensive authentication system',
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC',
            },
            contact: {
                name: 'BUIANDU',
            },
        },
        servers: [
            {
                url: `http://${config.baseUrl}/api/v1`,
                description: 'Development server',
            },
            {
                url: '/api/v1',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        code: {
                            type: 'integer',
                            format: 'int32',
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        username: {
                            type: 'string',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                        },
                        isActive: {
                            type: 'boolean',
                        },
                    },
                },
                UserProfile: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                        },
                        userId: {
                            type: 'string',
                            format: 'uuid',
                        },
                        firstName: {
                            type: 'string',
                        },
                        lastName: {
                            type: 'string',
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/api/routes/*.ts', './src/api/controllers/*.ts'],
};

export default swaggerOptions;