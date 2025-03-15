import logger from "./logger";

export default class RetryHandler {
    private static MAX_RETRY = 3;
    private static RETRY_WAIT = 1000;
    /**
     * Executes a function with retry logic
     */
    public static async execute<ResponseType>(
        fn: () => Promise<ResponseType>,
        name: string,
        options: {
            maxRetry?: number;
            retryWait?: number;
            condition?: (result: ResponseType) => boolean;
            failAction?: () => void;
            fallbackAction?: () => void;
        }
    ): Promise<ResponseType | null> {
        const maxRetry = options.maxRetry || this.MAX_RETRY;
        const retryWait = options.retryWait || this.RETRY_WAIT;
        
        return this.retryWrapper(fn, name, {
            retryIndex: 0,
            MAX_RETRY: maxRetry,
            RETRY_WAIT: retryWait,
            condition: options.condition,
            failAction: options.failAction,
            fallbackAction: options.fallbackAction
        });
    }

    /**
     * Internal retry wrapper implementation
     */
    public static async retryWrapper<ResponseType>(
        fn: () => Promise<ResponseType>,
        name: string,
        retryOpt: {
            retryIndex: number;
            MAX_RETRY: number;
            RETRY_WAIT: number;
            condition?: (result: ResponseType) => boolean;
            failAction?: () => void;
            fallbackAction?: () => void;
        }
    ): Promise<ResponseType | null> {
        const { retryIndex, MAX_RETRY, RETRY_WAIT, condition, fallbackAction, failAction } = retryOpt;
        try {
            const result = await fn();
            if (condition && !condition(result)) {
                throw new Error('Condition not met');
            }
            return result;
        } catch (error) {
            if (retryIndex < MAX_RETRY) {
                failAction && failAction();
                logger.alert(`[${name}] Attempt ${retryIndex + 1} failed. Retrying in ${(RETRY_WAIT / 1000)} seconds...`);
                await new Promise((resolve) => setTimeout(resolve, RETRY_WAIT));
                return this.retryWrapper(fn, name, { ...retryOpt, retryIndex: retryIndex + 1 });
            }
            logger.alert(`[${name}] Failed after ${MAX_RETRY} attempts:`, error);
            fallbackAction && fallbackAction();
            return null;
        }
    }
}