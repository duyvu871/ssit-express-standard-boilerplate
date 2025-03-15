import { z } from "zod";

export class DateUtils {
    /**
     * Validates a date of birth using Zod schema
     * @param value The date value to validate (string or Date)
     * @returns Zod schema for date validation
     */
    public static validateDateOfBirth() {
        return z.preprocess(
            (arg) => {
                if (typeof arg === 'string' || arg instanceof Date) {
                    return new Date(arg);
                }
                return arg;
            },
            z.date()
                .max(new Date(), { message: 'Ngày sinh không thể là ngày trong tương lai' })
                .transform((date) => {
                    // Ensure consistent timezone handling
                    return new Date(date.toISOString());
                })
        );
    }
}