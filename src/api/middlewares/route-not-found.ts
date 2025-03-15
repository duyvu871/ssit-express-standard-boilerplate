import { Request, Response, NextFunction } from 'express';
import Forbidden from 'responses/client-errors/forbidden';

const routeNotFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Forbidden(
        'ROUTE_NOT_FOUND',
        'Route not found',
        'Route not found'
    );

    next(error);
}

export default routeNotFound; 