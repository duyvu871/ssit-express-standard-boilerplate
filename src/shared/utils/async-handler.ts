import { Request, Response, NextFunction } from 'express';

export type Await<T> = T extends {
    then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

class AsyncMiddleware {
    static asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
        return (req: Request, res: Response, next: NextFunction) => {
            fn(req, res, next).catch(next);
        };
    }
}

export default AsyncMiddleware;