import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import swaggerOptions from 'config/swagger.config';

/**
 * Configure Swagger middleware for API documentation
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
    // Generate Swagger specification
    const swaggerSpec = swaggerJsdoc(swaggerOptions);

    // Setup Swagger UI endpoint
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
        },
    }));

    // Serve Swagger specification as JSON
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('Swagger documentation available at /api-docs');
};