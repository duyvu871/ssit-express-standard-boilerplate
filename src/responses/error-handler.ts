import Unauthorized from 'responses/client-errors/unauthorized';
import BadRequest from 'responses/client-errors/bad-request';
import NotFound from 'responses/client-errors/not-found';
import UnprocessableEntity from 'responses/client-errors/unprocessable-entity';
import InternalServerError from 'server/responses/server-errors/internal-server-error';
import Forbidden from 'responses/client-errors/forbidden';
import Conflict from 'responses/client-errors/conflict';

import { ICustomErrorResponse } from "common/interfaces/responses";
import { Request, Response, NextFunction } from "express";

export default (err: Error | ICustomErrorResponse, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next();
    }

    // console.log('name', err.constructor.name);

    if (
        err instanceof Unauthorized ||
        err instanceof BadRequest ||
        err instanceof NotFound ||
        err instanceof Unauthorized ||
        err instanceof UnprocessableEntity ||
        err instanceof InternalServerError ||
        err instanceof Forbidden ||
        err instanceof Conflict
    ) {
        return reportCustomError(err, res);
    }

    if ('message' in err && err.message === 'Route not found') {
        return res.status(404).send("Route not found").end();
    }

    if ('message' in err) {
        console.log('err', err.message);
    } else {
        console.log('err', err);
    }
    
    next(err);
    return reportCustomError({
        statusCode: 500,
        errorCode: 'internal_server_error',
        errorDescription: 'Internal Server Error',
        errorMessage: 'Internal Server Error',
    }, res);
}

const reportCustomError = (err: ICustomErrorResponse, res: Response) => {
    const { statusCode = 500 } = err;
    return res.status(statusCode).json({
        statusCode,
        errorCode: err.errorCode,
        errorDescription: err.errorDescription,
        errorMessage: err.errorMessage,
    }).end();
}