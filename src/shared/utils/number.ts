import { z } from "zod";

export class NumberUtils {
    /**
     * Separates a number into an array of numbers based on a given range
     * @param number The number to separate
     * @param range The range to separate by
     * @returns Array of numbers
     */
    public static separateNumber(number: number, range: number): number[] {
        const result: number[] = [];
        const excess = number % range;
        const fullFits = Math.floor(number / range);
        
        for (let i = 0; i < fullFits; i++) {
            result.push(range);
        }
        
        if (excess > 0) {
            result.push(excess);
        }

        return result;
    }

    /**
     * Creates a Zod validator for number fields
     * @param fieldName The name of the field to validate
     * @param isPositive Whether the number should be positive
     * @param isInteger Whether the number should be an integer
     * @returns Zod schema for number validation
     */
    public static validateNumber(fieldName: string, isPositive: boolean = false, isInteger: boolean = false) {
        return z
            .string()
            .refine((s) => {
                const n = Number(s);
                if (isPositive && n <= 0) return false;
                if (isInteger && !Number.isInteger(n)) return false;

                return Number.isFinite(n) && !Number.isNaN(n);
            }, value => ({ message: `Field ${fieldName} Expected number or numeric string, received '${value}'` }))
            .transform(Number);
    }
}
